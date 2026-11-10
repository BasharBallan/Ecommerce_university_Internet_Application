const axios = require('axios');
const cacheService = require('../../utils/cacheService');
const grpcClient = require('../../utils/grpcInventoryClient');

const LARAVEL_HTTP_URL = process.env.INVENTORY_HTTP_URL || 'http://inventory-service:8000/api';
const DEFAULT_TTL_SECONDS = 60; // 60 seconds TTL

class ProductService {
  /**
   * Fetch single product details via gRPC from Laravel, with optional Upstash Redis Caching.
   * @param {string|number} productId
   * @param {boolean} [bypassRedis=false]
   * @returns {Promise<{data: object, fromCache: boolean}>}
   */
  async getProductById(productId, bypassRedis = false) {
    const cacheKey = `product:${productId}`;

    // 1. Check Upstash Redis Cache if NOT bypassed
    if (!bypassRedis && process.env.DISABLE_REDIS !== 'true') {
      const cachedProduct = await cacheService.get(cacheKey);
      if (cachedProduct) {
        return {
          data: typeof cachedProduct === 'string' ? JSON.parse(cachedProduct) : cachedProduct,
          fromCache: true,
        };
      }
    }

    // 2. Cache MISS / Redis disabled: Query Laravel via gRPC microservice
    const grpcResponse = await grpcClient.getProduct(String(productId));

    if (!grpcResponse || !grpcResponse.found) {
      return { data: null, fromCache: false };
    }

    const productData = {
      _id: grpcResponse.id,
      id: Number(grpcResponse.id),
      title: grpcResponse.title,
      slug: grpcResponse.slug,
      price: grpcResponse.price,
      quantity: grpcResponse.quantity,
      category: grpcResponse.category,
      imageCover: grpcResponse.image_cover,
      message: grpcResponse.message,
    };

    // 3. Store in Upstash Redis with TTL if enabled
    if (!bypassRedis && process.env.DISABLE_REDIS !== 'true') {
      await cacheService.set(cacheKey, productData, DEFAULT_TTL_SECONDS);
    }

    return {
      data: productData,
      fromCache: false,
    };
  }

  /**
   * Fetch paginated/filtered products list with optional Upstash Redis Caching.
   * @param {object} queryParams
   * @param {boolean} [bypassRedis=false]
   * @returns {Promise<{data: object, fromCache: boolean}>}
   */
  async getAllProducts(queryParams = {}, bypassRedis = false) {
    const queryString = new URLSearchParams(queryParams).toString();
    const cacheKey = `products:list:${queryString || 'default'}`;

    // 1. Check Upstash Redis if NOT bypassed
    if (!bypassRedis && process.env.DISABLE_REDIS !== 'true') {
      const cachedList = await cacheService.get(cacheKey);
      if (cachedList) {
        return {
          data: typeof cachedList === 'string' ? JSON.parse(cachedList) : cachedList,
          fromCache: true,
        };
      }
    }

    // 2. Cache MISS / Redis disabled: Query Laravel Inventory Service HTTP endpoint
    const response = await axios.get(`${LARAVEL_HTTP_URL}/products?${queryString}`, {
      timeout: 5000,
    });

    const data = response.data;

    // 3. Store in Upstash Redis with TTL if enabled
    if (!bypassRedis && process.env.DISABLE_REDIS !== 'true') {
      await cacheService.set(cacheKey, data, DEFAULT_TTL_SECONDS);
    }

    return {
      data,
      fromCache: false,
    };
  }

  /**
   * Invalidate product cache upon modification, deletion, or stock change.
   * @param {string|number} productId
   */
  async invalidateProductCache(productId) {
    const key = `product:${productId}`;
    await cacheService.del(key);
    console.log(`🧹 Cache invalidated for product ID: ${productId}`);
  }
}

module.exports = new ProductService();
