const path = require('path');
const dotenv = require('dotenv');
const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../config.env') });

// Silence internal application console.log so only our clean summary appears
const originalConsoleLog = console.log;
console.log = () => {};

const print = (msg) => process.stdout.write(`${msg}\n`);

const app = require('../app');
const userRepository = require('../modules/user/userRepository');
const orderRepository = require('../modules/order/orderRepository');
const createToken = require('../utils/createToken');
const { checkStock } = require('../utils/grpcInventoryClient');

jest.setTimeout(30000);

const LARAVEL_API =
  process.env.LARAVEL_API_URL ||
  (process.env.INVENTORY_GRPC_URL && process.env.INVENTORY_GRPC_URL.includes('inventory-service')
    ? 'http://inventory-service:8000/api'
    : 'http://localhost:8001/api');

// Helper to format clean response JSON for display
const formatProductResponse = (body) => {
  return JSON.stringify(
    {
      status: body.status,
      data: {
        id: body.data?.id,
        title: body.data?.title,
        price: body.data?.price,
        quantity: body.data?.quantity,
        category: body.data?.category,
      },
    },
    null,
    2
  );
};

describe('Integration Test: Order Creation Failure & Stock Rollback (Compensating Transaction)', () => {
  let userToken;
  let testUser;
  let testProduct;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const dbUri = process.env.DB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tic_db';
      await mongoose.connect(dbUri);
    }

    testUser = await userRepository.findByEmail('rollback_tester@test.com');
    if (!testUser) {
      testUser = await userRepository.create({
        name: 'Rollback Tester',
        email: 'rollback_tester@test.com',
        password: 'Password123!',
        role: 'user',
      });
    }
    userToken = createToken(testUser._id);

    // Create a product with 10 units in stock in Laravel MySQL
    const createRes = await axios.post(`${LARAVEL_API}/products`, {
      title: 'Rollback Item (10 in stock)',
      slug: `rollback-item-${Date.now()}`,
      description: 'Product for compensating transaction verification',
      quantity: 10,
      price: 25.0,
      category: 'Beverages',
      image_cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    });
    testProduct = createRes.data.data;

    print('\n================================================================================');
    print(`[SETUP] Created product ID: ${testProduct.id} | Initial Stock: ${testProduct.quantity} units in MySQL`);
    print('================================================================================');
  });

  afterAll(async () => {
    if (testProduct && testProduct.id) {
      try {
        await axios.delete(`${LARAVEL_API}/products/${testProduct.id}`);
      } catch (e) {}
    }

    if (testUser && testUser._id) {
      const Order = mongoose.model('Order');
      await Order.deleteMany({ user: testUser._id });
    }

    await mongoose.connection.close();
    console.log = originalConsoleLog;
  });

  test('When MongoDB fails to save the order after reservation, stock is automatically refunded via gRPC', async () => {
    const productIdStr = String(testProduct.id);

    // --------------------------------------------------------------------------
    // 1. API GET PRODUCT - BEFORE DEDUCTION
    // --------------------------------------------------------------------------
    const getBeforeRes = await request(app)
      .get(`/api/v1/products/${productIdStr}`)
      .set('x-bypass-redis', 'true');

    print(`\n1. [API GET PRODUCT - BEFORE DEDUCTION]`);
    print(`   Request : GET /api/v1/products/${productIdStr}`);
    print(`   Status  : ${getBeforeRes.status} OK`);
    print(`   Response Body (JSON):`);
    print(formatProductResponse(getBeforeRes.body));
    print(`   Stock Status: ${getBeforeRes.body.data?.quantity} units available.`);

    expect(getBeforeRes.status).toBe(200);
    expect(Number(getBeforeRes.body.data?.quantity)).toBe(10);

    // --------------------------------------------------------------------------
    // 2. Mock orderRepository.create to inspect API GET PRODUCT after deduction,
    //    then trigger the simulated database crash
    // --------------------------------------------------------------------------
    let stockDuringDeduction = null;
    let getDuringBody = null;

    const spy = jest.spyOn(orderRepository, 'create').mockImplementationOnce(async () => {
      // At this point, gRPC reserveStock has ALREADY deducted the 3 units in MySQL!
      const getDuringRes = await request(app)
        .get(`/api/v1/products/${productIdStr}`)
        .set('x-bypass-redis', 'true');

      getDuringBody = getDuringRes.body;
      stockDuringDeduction = Number(getDuringRes.body.data?.quantity);

      print(`\n2. [API GET PRODUCT - AFTER DEDUCTION / DURING RESERVATION]`);
      print(`   Request : GET /api/v1/products/${productIdStr}`);
      print(`   Status  : ${getDuringRes.status} OK`);
      print(`   Response Body (JSON):`);
      print(formatProductResponse(getDuringBody));
      print(`   Stock Status: Successfully deducted from 10 to ${stockDuringDeduction} units via gRPC reserveStock!`);

      print(`\n3. [SIMULATED FAULT] Database crash occurred in MongoDB while saving the order!`);
      throw new Error('Simulated Database Write Failure / Connection Lost');
    });

    const orderPayload = {
      orderItems: [{ product: productIdStr, quantity: 3 }],
    };

    print('\n--- [ORDER REQUEST DISPATCHED] ---');
    print('Method : POST /api/v1/orders (Requesting 3 units)');
    print(`Payload: ${JSON.stringify(orderPayload)}`);

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(orderPayload);

    print('\n--- [ORDER RESPONSE RECEIVED] ---');
    print(`Status Code  : HTTP ${orderRes.status} Internal Server Error`);
    print(`Response Body: ${JSON.stringify({
      status: orderRes.body.status,
      message: orderRes.body.message,
    })}`);
    print('Explanation  : Order creation failed in MongoDB. System caught error and triggered compensating transaction (releaseStock via gRPC).');

    // Brief wait for async gRPC compensation to settle
    await new Promise((r) => setTimeout(r, 400));

    // --------------------------------------------------------------------------
    // 4. API GET PRODUCT - AFTER ROLLBACK (COMPENSATING TRANSACTION)
    // --------------------------------------------------------------------------
    const getAfterRes = await request(app)
      .get(`/api/v1/products/${productIdStr}`)
      .set('x-bypass-redis', 'true');

    print(`\n4. [API GET PRODUCT - AFTER ROLLBACK (COMPENSATING TRANSACTION)]`);
    print(`   Request : GET /api/v1/products/${productIdStr}`);
    print(`   Status  : ${getAfterRes.status} OK`);
    print(`   Response Body (JSON):`);
    print(formatProductResponse(getAfterRes.body));
    print(`   Stock Status: ${getAfterRes.body.data?.quantity}/10 units restored (refunded +3 units back to warehouse)!`);
    print('================================================================================\n');

    expect(orderRes.status).toBe(500);
    expect(stockDuringDeduction).toBe(7);
    expect(Number(getAfterRes.body.data?.quantity)).toBe(10);

    spy.mockRestore();
  });
});
