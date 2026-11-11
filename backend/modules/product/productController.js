const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const productService = require('./productService');

// In-memory mapping of resource key -> current ETag for instant 304 validation
const knownETags = new Map();

/**
 * Helper to generate MD5 ETag from response body.
 * @param {object|string} body
 * @returns {string}
 */
const generateETag = (body) => {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;
};

/**
 * @desc   Get single product by ID (Upstash Redis + gRPC to Laravel + ETag)
 * @route  GET /api/v1/products/:id
 * @access Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resourceKey = `product:${id}`;
  const clientEtag = req.headers['if-none-match'];
  const bypassRedis = req.headers['x-bypass-redis'] === 'true' || req.query.no_cache === '1';

  // Fast-path ETag 304 Check: If client sends current ETag and resource hasn't changed
  if (clientEtag && knownETags.has(resourceKey) && knownETags.get(resourceKey) === clientEtag) {
    res.setHeader('ETag', clientEtag);
    res.setHeader('X-Cache', 'ETAG-304');
    return res.status(304).end();
  }

  const { data, fromCache } = await productService.getProductById(id, bypassRedis);

  if (!data) {
    return res.status(404).json({
      status: 'fail',
      message: `No product found with ID: ${id}`,
    });
  }

  // Generate and store ETag (reuse pre-calculated ETag on cache HIT)
  let etag = knownETags.get(resourceKey);
  if (!etag || !fromCache) {
    etag = generateETag(data);
    knownETags.set(resourceKey, etag);
  }

  if (clientEtag && clientEtag === etag) {
    res.setHeader('ETag', etag);
    res.setHeader('X-Cache', 'ETAG-304');
    return res.status(304).end();
  }

  res.setHeader('ETag', etag);
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.setHeader('Cache-Control', 'public, max-age=60');

  res.status(200).json({
    status: 'success',
    source: fromCache ? 'Upstash Redis Cache' : 'Laravel gRPC Microservice',
    data,
  });
});

/**
 * @desc   Get all products (Upstash Redis + Laravel HTTP + ETag)
 * @route  GET /api/v1/products
 * @access Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const queryString = new URLSearchParams(req.query).toString();
  const resourceKey = `products:list:${queryString || 'default'}`;
  const clientEtag = req.headers['if-none-match'];
  const bypassRedis = req.headers['x-bypass-redis'] === 'true' || req.query.no_cache === '1';

  // Fast-path ETag 304 Check
  if (clientEtag && knownETags.has(resourceKey) && knownETags.get(resourceKey) === clientEtag) {
    res.setHeader('ETag', clientEtag);
    res.setHeader('X-Cache', 'ETAG-304');
    return res.status(304).end();
  }

  const { data, fromCache } = await productService.getAllProducts(req.query, bypassRedis);

  let etag = knownETags.get(resourceKey);
  if (!etag || !fromCache) {
    etag = generateETag(data);
    knownETags.set(resourceKey, etag);
  }

  if (clientEtag && clientEtag === etag) {
    res.setHeader('ETag', etag);
    res.setHeader('X-Cache', 'ETAG-304');
    return res.status(304).end();
  }

  res.setHeader('ETag', etag);
  res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.setHeader('Cache-Control', 'public, max-age=60');

  res.status(200).json({
    status: 'success',
    source: fromCache ? 'Upstash Redis Cache' : 'Laravel Database',
    ...data,
  });
});

/**
 * @desc   Invalidate product cache manually (or upon updates)
 * @route  POST /api/v1/products/:id/invalidate-cache
 * @access Admin/Internal
 */
const invalidateCache = asyncHandler(async (req, res) => {
  const { id } = req.params;
  knownETags.delete(`product:${id}`);
  await productService.invalidateProductCache(id);

  res.status(200).json({
    status: 'success',
    message: `Cache for product ${id} successfully invalidated from Upstash Redis and ETag cache.`,
  });
});

module.exports = {
  getProduct,
  getProducts,
  invalidateCache,
};
