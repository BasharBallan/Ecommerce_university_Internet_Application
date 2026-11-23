const { connectRabbitMQ, TOPOLOGY } = require('../config/rabbitmq');

/**
 * Publish order confirmation email job to RabbitMQ.
 * Messages are flagged persistent (written to disk) to guarantee durability.
 *
 * @param {object} payload
 * @param {string} payload.orderId
 * @param {string} payload.userEmail
 * @param {string} [payload.userName]
 * @param {number} payload.totalPrice
 * @param {Array} [payload.orderItems]
 * @param {string} [payload.createdAt]
 * @returns {Promise<boolean>}
 */
async function sendOrderConfirmationJob(payload) {
  try {
    const channel = await connectRabbitMQ();

    const messageBuffer = Buffer.from(JSON.stringify(payload));

    const published = channel.publish(
      TOPOLOGY.EXCHANGE,
      TOPOLOGY.ROUTING_KEY,
      messageBuffer,
      {
        persistent: true, // Guarantees message is written to disk by RabbitMQ
        contentType: 'application/json',
        timestamp: Date.now(),
        headers: {
          'x-retry-count': 0,
        },
      }
    );

    console.log(`📨 [RabbitMQ] Order confirmation email job dispatched for Order #${payload.orderId} to: ${payload.userEmail}`);
    return published;
  } catch (err) {
    console.error(`⚠️ [RabbitMQ] Failed to dispatch email job for Order #${payload?.orderId}:`, err.message);
    // Notice: We don't throw, ensuring order creation succeeds even if message broker is down (Fault Tolerance)
    return false;
  }
}

module.exports = {
  sendOrderConfirmationJob,
};
