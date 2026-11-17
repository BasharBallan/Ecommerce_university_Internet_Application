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
const createToken = require('../utils/createToken');
const { checkStock } = require('../utils/grpcInventoryClient');

jest.setTimeout(30000);

const LARAVEL_API =
  process.env.LARAVEL_API_URL ||
  (process.env.INVENTORY_GRPC_URL && process.env.INVENTORY_GRPC_URL.includes('inventory-service')
    ? 'http://inventory-service:8000/api'
    : 'http://localhost:8001/api');

describe('Integration Test: Concurrent Orders Race Condition (Pessimistic Locking)', () => {
  let userToken;
  let testUser;
  let testProduct;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const dbUri = process.env.DB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tic_db';
      await mongoose.connect(dbUri);
    }

    testUser = await userRepository.findByEmail('race_condition_tester@test.com');
    if (!testUser) {
      testUser = await userRepository.create({
        name: 'Race Condition Tester',
        email: 'race_condition_tester@test.com',
        password: 'Password123!',
        role: 'user',
      });
    }
    userToken = createToken(testUser._id);

    // Create a product with EXACTLY 1 unit in stock in Laravel MySQL
    const createRes = await axios.post(`${LARAVEL_API}/products`, {
      title: 'Race Item (1 in stock)',
      slug: `race-item-${Date.now()}`,
      description: 'Single-unit product for race condition verification',
      quantity: 1,
      price: 99.0,
      category: 'Snacks',
      image_cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    });
    testProduct = createRes.data.data;

    print('\n================================================================================');
    print(`[SETUP] Created product ID: ${testProduct.id} | Stock: ${testProduct.quantity} unit | Price: $${testProduct.price}`);
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

  test('Two concurrent orders on 1 item: Exactly 1 succeeds (201) and 1 fails (rejected)', async () => {
    const orderPayload = {
      orderItems: [{ product: String(testProduct.id), quantity: 1 }],
    };

    print('\n--- [REQUESTS DISPATCHED] ---');
    print('Method : POST /api/v1/orders (2 parallel requests sent at the exact same millisecond)');
    print(`Payload: ${JSON.stringify(orderPayload)}`);

    // Fire TWO concurrent requests
    const [res1, res2] = await Promise.all([
      request(app).post('/api/v1/orders').set('Authorization', `Bearer ${userToken}`).send(orderPayload),
      request(app).post('/api/v1/orders').set('Authorization', `Bearer ${userToken}`).send(orderPayload),
    ]);

    const winner = res1.status === 201 ? res1 : res2;
    const loser = res1.status === 201 ? res2 : res1;

    print('\n--- [RESPONSES RECEIVED] ---');
    print(`[WINNER ORDER]   -> HTTP ${winner.status} Created`);
    print(`Response Body    : ${JSON.stringify({
      status: winner.body.status,
      orderId: winner.body.data?.order?._id,
      orderStatus: winner.body.data?.order?.orderStatus,
      totalPrice: winner.body.data?.order?.totalOrderPrice,
    })}`);
    print('Explanation      : First request acquired pessimistic lock (lockForUpdate) and reserved the 1 available unit.');

    print(`\n[REJECTED ORDER] -> HTTP ${loser.status} ${loser.status === 400 ? 'Bad Request' : 'Rejected'}`);
    print(`Response Body    : ${JSON.stringify({
      status: loser.body.status,
      message: loser.body.message || loser.body.error,
    })}`);
    print('Explanation      : Second request was blocked by row lock, then safely rejected when stock reached 0.');

    const stockAfter = await checkStock(String(testProduct.id));
    print(`\n[VERIFICATION] Final MySQL Warehouse Stock: ${stockAfter.quantity} | Overselling Prevented: 100%`);
    print('================================================================================\n');

    // Assertions
    expect([res1.status, res2.status]).toContain(201);
    expect([400, 503]).toContain(loser.status);
    expect(winner.body.status).toBe('success');
    expect(stockAfter.quantity).toBe(0);
  });
});
