const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.resolve(__dirname, '../proto/inventory.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const inventoryPackage = protoDescriptor.inventory;

const GRPC_SERVER_URL = process.env.INVENTORY_GRPC_URL || '127.0.0.1:50051';

const client = new inventoryPackage.InventoryService(
  GRPC_SERVER_URL,
  grpc.credentials.createInsecure()
);

/**
 * Helper to generate deadline timestamp.
 * @param {number} timeoutMs
 */
const getDeadline = (timeoutMs = 5000) => new Date(Date.now() + timeoutMs);

/**
 * Query product details from Laravel MySQL database via gRPC.
 * @param {string} productId
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<{found: boolean, id: string, title: string, slug: string, price: number, quantity: number, category: string, image_cover: string, message: string}>}
 */
const getProduct = (productId, timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    client.GetProduct(
      { product_id: String(productId) },
      { deadline: getDeadline(timeoutMs) },
      (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      }
    );
  });
};

/**
 * Check stock for a given product ID.
 * @param {string} productId
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<{available: boolean, quantity: number, message: string}>}
 */
const checkStock = (productId, timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    client.CheckStock(
      { product_id: String(productId) },
      { deadline: getDeadline(timeoutMs) },
      (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      }
    );
  });
};

/**
 * Reserve stock for a product.
 * @param {string} productId
 * @param {number} quantity
 * @param {string} orderId
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<{success: boolean, message: string, remaining: number}>}
 */
const reserveStock = (productId, quantity, orderId = '', timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    client.ReserveStock(
      {
        product_id: String(productId),
        quantity: Number(quantity),
        order_id: String(orderId),
      },
      { deadline: getDeadline(timeoutMs) },
      (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      }
    );
  });
};

/**
 * Release stock previously reserved.
 * @param {string} productId
 * @param {number} quantity
 * @param {string} orderId
 * @param {number} [timeoutMs=5000]
 * @returns {Promise<{success: boolean, message: string}>}
 */
const releaseStock = (productId, quantity, orderId = '', timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    client.ReleaseStock(
      {
        product_id: String(productId),
        quantity: Number(quantity),
        order_id: String(orderId),
      },
      { deadline: getDeadline(timeoutMs) },
      (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      }
    );
  });
};

module.exports = {
  client,
  getProduct,
  checkStock,
  reserveStock,
  releaseStock,
  grpcStatus: grpc.status,
};
