const amqp = require('amqplib');

let connection = null;
let channel = null;

const DEFAULT_RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  (process.env.NODE_ENV === 'test'
    ? 'amqp://admin:admin@localhost:5672'
    : 'amqp://admin:admin@rabbitmq:5672');

// Centralized Topology Constants for Production Reliability
const TOPOLOGY = {
  EXCHANGE: 'orders.exchange',
  ROUTING_KEY: 'order.created',
  QUEUE: 'order_email_queue',
  DLX_EXCHANGE: 'orders.dlx',
  DLX_ROUTING_KEY: 'order.email.dead',
  DLQ_QUEUE: 'orders_email_dlq',
};

/**
 * Connect to RabbitMQ broker and initialize robust topology:
 * - Direct Exchange for orders
 * - Durable Main Queue with Dead Letter Exchange (DLX) forwarding arguments
 * - Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ) for failed/poison messages
 */
async function connectRabbitMQ() {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL || DEFAULT_RABBITMQ_URL;

  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    connection.on('error', (err) => {
      console.error('❌ [RabbitMQ] Connection error:', err.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('⚠️ [RabbitMQ] Connection closed');
      }
      channel = null;
      connection = null;
    });

    // 1. Declare Dead Letter Exchange (DLX) and Dead Letter Queue (DLQ)
    await channel.assertExchange(TOPOLOGY.DLX_EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(TOPOLOGY.DLQ_QUEUE, { durable: true });
    await channel.bindQueue(TOPOLOGY.DLQ_QUEUE, TOPOLOGY.DLX_EXCHANGE, TOPOLOGY.DLX_ROUTING_KEY);

    // 2. Declare Main Exchange and Main Queue with DLX arguments
    await channel.assertExchange(TOPOLOGY.EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(TOPOLOGY.QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': TOPOLOGY.DLX_EXCHANGE,
        'x-dead-letter-routing-key': TOPOLOGY.DLX_ROUTING_KEY,
      },
    });
    await channel.bindQueue(TOPOLOGY.QUEUE, TOPOLOGY.EXCHANGE, TOPOLOGY.ROUTING_KEY);

    console.log('⚡ [RabbitMQ] Connected & Topology Initialized (DLX & DLQ Ready)');
    return channel;
  } catch (err) {
    console.error('❌ [RabbitMQ] Failed to connect to:', url, err.message);
    throw err;
  }
}

async function closeRabbitMQ() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (_) {}
  channel = null;
  connection = null;
}

module.exports = {
  connectRabbitMQ,
  closeRabbitMQ,
  TOPOLOGY,
};
