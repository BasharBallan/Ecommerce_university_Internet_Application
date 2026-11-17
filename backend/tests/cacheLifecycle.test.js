const path = require('path');
const dotenv = require('dotenv');
const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../config.env') });

// Silence internal application console.log so only our clean test report appears
const originalConsoleLog = console.log;
console.log = () => {};

const print = (msg) => process.stdout.write(`${msg}\n`);

const app = require('../app');
const cacheService = require('../utils/cacheService');

jest.setTimeout(30000);

const LARAVEL_API =
  process.env.LARAVEL_API_URL ||
  (process.env.INVENTORY_GRPC_URL && process.env.INVENTORY_GRPC_URL.includes('inventory-service')
    ? 'http://inventory-service:8000/api'
    : 'http://localhost:8001/api');

describe('Integration Test: Multi-Layer Cache Lifecycle & Invalidation (Redis + ETag 304)', () => {
  let testProduct;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const dbUri = process.env.DB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tic_db';
      await mongoose.connect(dbUri);
    }

    // 1. Create a fresh test product directly in Laravel MySQL
    const createRes = await axios.post(`${LARAVEL_API}/products`, {
      title: 'Cache Lifecycle Item',
      slug: `cache-item-${Date.now()}`,
      description: 'Testing Cache MISS, Cache HIT, ETag 304, and Mutation Invalidation',
      quantity: 50,
      price: 49.99,
      category: 'Snacks',
      image_cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    });
    testProduct = createRes.data.data;

    // Ensure cache starts clean for this product
    await cacheService.del(`product:${testProduct.id}`);
  });

  afterAll(async () => {
    if (testProduct && testProduct.id) {
      try {
        await axios.delete(`${LARAVEL_API}/products/${testProduct.id}`);
        await cacheService.del(`product:${testProduct.id}`);
      } catch (_) {}
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log = originalConsoleLog;
  });

  it('Step 1 -> MISS, Step 2 -> HIT, Step 3 -> ETag 304, Step 4 -> Invalidate, Step 5 -> Fresh MISS, Step 6 -> Fresh HIT', async () => {
    print('\n================================================================================');
    print(`   🚀 MULTI-LAYER CACHING & INVALIDATION PROOF (Product ID: ${testProduct.id})`);
    print('================================================================================\n');

    // --------------------------------------------------------------------------
    // 1. First Request: Cache MISS (Fetches from Database)
    // --------------------------------------------------------------------------
    const t0 = Date.now();
    const res1 = await request(app).get(`/api/v1/products/${testProduct.id}`);
    const dur1 = Date.now() - t0;

    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache']).toBe('MISS');
    expect(res1.body.source).toMatch(/Laravel/i);
    expect(res1.headers.etag).toBeDefined();

    const productEtag = res1.headers.etag;

    print('1. [FIRST REQUEST - CACHE MISS (RAW DATABASE)]');
    print(`   Endpoint      : GET /api/v1/products/${testProduct.id}`);
    print(`   HTTP Status   : ${res1.status} OK`);
    print(`   X-Cache Header: ${res1.headers['x-cache']}`);
    print(`   Data Source   : ${res1.body.source}`);
    print(`   Response Time : ${dur1} ms`);
    print(`   Generated ETag: ${productEtag}`);
    print('   Explanation   : Data queried from MySQL via gRPC, cached in Redis with TTL=60s.\n');

    // --------------------------------------------------------------------------
    // 2. Second Request: Cache HIT (Served from Redis RAM)
    // --------------------------------------------------------------------------
    const t1 = Date.now();
    const res2 = await request(app).get(`/api/v1/products/${testProduct.id}`);
    const dur2 = Date.now() - t1;

    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache']).toBe('HIT');
    expect(res2.body.source).toMatch(/Redis/i);
    expect(res2.headers.etag).toBe(productEtag);

    print('2. [SECOND REQUEST - CACHE HIT (UPSTASH REDIS RAM)]');
    print(`   Endpoint      : GET /api/v1/products/${testProduct.id}`);
    print(`   HTTP Status   : ${res2.status} OK`);
    print(`   X-Cache Header: ${res2.headers['x-cache']}`);
    print(`   Data Source   : ${res2.body.source}`);
    print(`   Response Time : ${dur2} ms`);
    print(`   Speedup Factor: ${(dur1 / Math.max(dur2, 1)).toFixed(1)}x faster than Raw DB`);
    print('   Explanation   : Intercepted in-memory by Redis RAM. Zero database queries executed.\n');

    // --------------------------------------------------------------------------
    // 3. Third Request: HTTP ETag Fast-Path (HTTP 304 Not Modified)
    // --------------------------------------------------------------------------
    const t2 = Date.now();
    const res3 = await request(app)
      .get(`/api/v1/products/${testProduct.id}`)
      .set('If-None-Match', productEtag);
    const dur3 = Date.now() - t2;

    expect(res3.status).toBe(304);
    expect(res3.headers['x-cache']).toBe('ETAG-304');
    expect(res3.text).toBe('');

    print('3. [THIRD REQUEST - CONDITIONAL ETAG (HTTP 304 NOT MODIFIED)]');
    print(`   Endpoint      : GET /api/v1/products/${testProduct.id}`);
    print(`   If-None-Match : ${productEtag}`);
    print(`   HTTP Status   : ${res3.status} Not Modified`);
    print(`   X-Cache Header: ${res3.headers['x-cache']}`);
    print(`   Transferred   : 0 bytes (Zero network payload bandwidth)`);
    print(`   Response Time : ${dur3} ms`);
    print('   Explanation   : Server verified ETag match in memory and returned 304 without body.\n');

    // --------------------------------------------------------------------------
    // 4. Mutation Event: Product Updated in Database & Cache Invalidated
    // --------------------------------------------------------------------------
    print('--- [MUTATION EVENT: STOCK / PRICE UPDATED & CACHE INVALIDATION] ---');

    // Update product price from 49.99 to 89.99 in MySQL
    await axios.put(`${LARAVEL_API}/products/${testProduct.id}`, {
      price: 89.99,
      quantity: 100,
    });

    // Invalidate Redis cache and ETag for this product
    const invRes = await request(app).post(`/api/v1/products/${testProduct.id}/invalidate-cache`);
    expect(invRes.status).toBe(200);

    print(`   Action        : Price changed $49.99 -> $89.99 in MySQL Database`);
    print(`   Cache Purge   : POST /api/v1/products/${testProduct.id}/invalidate-cache -> 200 OK`);
    print('   Explanation   : Cache-Aside pattern in action. Stale Redis key and ETag deleted.\n');

    // --------------------------------------------------------------------------
    // 5. Request After Invalidation: Cache MISS (Fetches Fresh Updated Data)
    // --------------------------------------------------------------------------
    const t3 = Date.now();
    const res4 = await request(app).get(`/api/v1/products/${testProduct.id}`);
    const dur4 = Date.now() - t3;

    expect(res4.status).toBe(200);
    expect(res4.headers['x-cache']).toBe('MISS');
    expect(res4.body.source).toMatch(/Laravel/i);
    expect(res4.body.data.price).toBe(89.99); // Verifies fresh data from DB!

    const newEtag = res4.headers.etag;
    expect(newEtag).not.toBe(productEtag); // New content has new ETag!

    print('4. [REQUEST AFTER INVALIDATION - FRESH CACHE MISS (UPDATED DATA)]');
    print(`   Endpoint      : GET /api/v1/products/${testProduct.id}`);
    print(`   HTTP Status   : ${res4.status} OK`);
    print(`   X-Cache Header: ${res4.headers['x-cache']}`);
    print(`   Data Source   : ${res4.body.source}`);
    print(`   Updated Price : $${res4.body.data.price} (Verified updated from MySQL!)`);
    print(`   New ETag Hash : ${newEtag} (Updated from old ${productEtag})`);
    print(`   Response Time : ${dur4} ms`);
    print('   Explanation   : Cache was missing so Node fetched fresh data from MySQL and re-cached it.\n');

    // --------------------------------------------------------------------------
    // 6. Request After Refresh: Cache HIT Again with New Data
    // --------------------------------------------------------------------------
    const res5 = await request(app).get(`/api/v1/products/${testProduct.id}`);

    expect(res5.status).toBe(200);
    expect(res5.headers['x-cache']).toBe('HIT');
    expect(res5.body.source).toMatch(/Redis/i);
    expect(res5.body.data.price).toBe(89.99);

    print('5. [SUBSEQUENT REQUEST - RE-WARMED CACHE HIT]');
    print(`   Endpoint      : GET /api/v1/products/${testProduct.id}`);
    print(`   HTTP Status   : ${res5.status} OK`);
    print(`   X-Cache Header: ${res5.headers['x-cache']}`);
    print(`   Data Source   : ${res5.body.source}`);
    print(`   Cached Price  : $${res5.body.data.price} (Served from Redis RAM)`);
    print('   Explanation   : Redis is now warm again with the updated product price.\n');

    print('================================================================================');
    print('   ✔ FULL CACHE LIFECYCLE & INVALIDATION PROVEN 100% SUCCESSFUL!');
    print('================================================================================\n');
  });
});

