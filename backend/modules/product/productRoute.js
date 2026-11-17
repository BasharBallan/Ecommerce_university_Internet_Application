const express = require('express');
const { getProduct, getProducts, invalidateCache } = require('./productController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management, multi-layer caching (Redis + HTTP ETag 304), and gRPC inventory integration
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "10050"
 *         id:
 *           type: integer
 *           example: 10050
 *         title:
 *           type: string
 *           example: "Organic Fresh Milk"
 *         slug:
 *           type: string
 *           example: "organic-fresh-milk-10050"
 *         description:
 *           type: string
 *           example: "High quality Organic Fresh Milk belonging to category Dairy. Tested and verified for supermarket stock."
 *         price:
 *           type: number
 *           example: 4.99
 *         quantity:
 *           type: integer
 *           example: 150
 *         availableqty:
 *           type: integer
 *           example: 150
 *         reservedqty:
 *           type: integer
 *           example: 0
 *         status:
 *           type: string
 *           enum: [in_stock, out_of_stock]
 *           example: "in_stock"
 *         category:
 *           type: string
 *           example: "Dairy"
 *         imageCover:
 *           type: string
 *           example: "https://images.unsplash.com/photo-1550583724-b2692b85b150"
 *         ratingsAverage:
 *           type: number
 *           example: 4.8
 *         ratingsQuantity:
 *           type: integer
 *           example: 120
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-10T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-11T10:00:00.000Z"
 *     ProductListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         source:
 *           type: string
 *           example: "Upstash Redis Cache"
 *         results:
 *           type: integer
 *           example: 50
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *               example: 1
 *             totalPages:
 *               type: integer
 *               example: 201
 *             totalItems:
 *               type: integer
 *               example: 10050
 *             perPage:
 *               type: integer
 *               example: 50
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products (with pagination, Redis cache & HTTP ETag)
 *     tags: [Products]
 *     description: >
 *       Retrieves the catalog of products with multi-layer performance optimizations:
 *       - **Redis RAM Cache**: Instant sub-millisecond retrieval (TTL: 60s).
 *       - **HTTP ETag (304 Not Modified)**: Zero-bandwidth transfer when client cache is fresh.
 *       - **MySQL Read Replica**: Read traffic offloaded to replica instance.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Dairy, Bakery, Beverages, Snacks, Canned, Meat, Poultry, Fruits, Vegetables, Grains, Oils, Pantry, Spices, Cleaning, Household, Personal Care]
 *         description: Filter products by category
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword matching product title or description
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, price, title, id]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sorting direction
 *       - in: header
 *         name: If-None-Match
 *         schema:
 *           type: string
 *         description: Client ETag token. If matching, server returns HTTP 304 without transferring body.
 *       - in: header
 *         name: x-bypass-redis
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Set to true to bypass Redis cache and query raw MySQL database directly (for benchmarking).
 *     responses:
 *       200:
 *         description: Product catalog retrieved successfully
 *         headers:
 *           ETag:
 *             schema:
 *               type: string
 *             description: MD5 checksum hash of the response content
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS, ETAG-304]
 *             description: Cache status indicator
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: "public, max-age=60"
 *             description: HTTP caching directive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 *       304:
 *         description: Not Modified. Client cache is fresh (zero response body).
 *         headers:
 *           ETag:
 *             schema:
 *               type: string
 *           X-Cache:
 *             schema:
 *               type: string
 *               example: "ETAG-304"
 *       500:
 *         description: Internal server error
 */
router.route('/')
  .get(getProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get single product details (gRPC + Redis + ETag)
 *     tags: [Products]
 *     description: >
 *       Retrieves product details and live warehouse inventory via **gRPC** protocol
 *       from the Laravel Inventory microservice. Results are cached in Redis with HTTP ETag validation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product numeric ID
 *         example: "10050"
 *       - in: header
 *         name: If-None-Match
 *         schema:
 *           type: string
 *         description: Client ETag token for 304 validation
 *       - in: header
 *         name: x-bypass-redis
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Bypass Redis cache
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         headers:
 *           ETag:
 *             schema:
 *               type: string
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS, ETAG-304]
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: "public, max-age=60"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 source:
 *                   type: string
 *                   example: "Upstash Redis Cache"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       304:
 *         description: Not Modified. Content matches client ETag.
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No product found with ID: 10050"
 *       500:
 *         description: Internal server error or gRPC communication failure
 */
router.route('/:id')
  .get(getProduct);

/**
 * @swagger
 * /api/v1/products/{id}/invalidate-cache:
 *   post:
 *     summary: Invalidate product cache (Redis & in-memory ETag)
 *     tags: [Products]
 *     description: >
 *       Manually purges Redis cache keys (`product:{id}` and `products:list:*`)
 *       and resets in-memory ETag hashes. Used upon order creation or stock mutation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product numeric ID to invalidate
 *         example: "10050"
 *     responses:
 *       200:
 *         description: Cache successfully invalidated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Cache for product 10050 successfully invalidated from Upstash Redis and ETag cache."
 *       500:
 *         description: Internal server error
 */
router.route('/:id/invalidate-cache')
  .post(invalidateCache);

module.exports = router;
