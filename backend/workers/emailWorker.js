const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables if running as standalone process
dotenv.config({ path: path.join(__dirname, '../config.env') });

const { connectRabbitMQ, TOPOLOGY } = require('../config/rabbitmq');
const sendEmail = require('../utils/sendEmail');
const orderRepository = require('../modules/order/orderRepository');

const MAX_RETRIES = 3;

/**
 * Ensure MongoDB connection for fetching user/order details when needed
 */
async function ensureDbConnected() {
  if (mongoose.connection.readyState === 0) {
    const dbUri = process.env.DB_URI || process.env.MONGO_URI || 'mongodb://mongo-db:27017/tic_db';
    await mongoose.connect(dbUri);
    console.log('📦 [EmailWorker] MongoDB Connected');
  }
}

/**
 * NOTIFY USER ON PERMANENT EMAIL DELIVERY FAILURE (DLQ):
 * When an order confirmation email job is permanently rejected to DLQ after exhausting all retries:
 * - We do NOT cancel the order and we do NOT return the inventory stock (the purchase remains valid!).
 * - We send a real-time notification alert to the user notifying them that their email could not be reached.
 */
async function notifyEmailDeliveryFailure(orderId, userEmail = '') {
  try {
    await ensureDbConnected();
    const order = await orderRepository.findById(orderId, false);
    if (!order) {
      console.warn(`⚠️ [Notification] Order #${orderId} not found in database.`);
      return;
    }

    const pusher = require('../config/pusher');
    const ownerId = order.user._id ? order.user._id.toString() : order.user.toString();
    const targetEmail = userEmail || order.user.email || 'your email';

    const userWarningMessage = `⚠️ تنبيه: هناك مشكلة في بريدك الإلكتروني (${targetEmail}) لم نتمكن من إيجاده وإرسال بريد التأكيد إليه؛ يرجى مراجعة وتحديث عنوان بريدك.`;

    const payload = {
      type: 'EMAIL_DELIVERY_FAILED',
      subType: 'EMAIL_DELIVERY_FAILED',
      orderId: order._id.toString(),
      orderStatus: order.orderStatus,
      userEmail: targetEmail,
      message: userWarningMessage,
    };

    // Push to Customer's order tracking page
    pusher.trigger(`private-order-${order._id.toString()}`, 'EMAIL_DELIVERY_FAILED', payload);
    pusher.trigger(`private-order-${order._id.toString()}`, 'ORDER_STATUS_UPDATED', payload);

    // Push to Customer's personal user channel
    pusher.trigger(`private-user-${ownerId}`, 'EMAIL_DELIVERY_FAILED', payload);

    // Push to Admin dashboard for visibility
    pusher.trigger('private-admin', 'EMAIL_DELIVERY_FAILED', payload);

    console.log(`⚡ [EmailWorker] Live email delivery warning delivered to User #${ownerId} via Soketi`);
  } catch (err) {
    console.error(`❌ [EmailWorker] Failed to send email failure notification for Order #${orderId}:`, err.message);
  }
}

/**
 * Generate high-quality HTML template for order confirmation receipt.
 */
function buildOrderEmailHtml(payload) {
  const { orderId, userName, totalPrice, orderItems = [], createdAt } = payload;
  const formattedDate = new Date(createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const itemsHtml = orderItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500; color: #1e293b;">${item.productTitle || item.title || `Product #${item.product}`}</td>
        <td style="padding: 12px; text-align: center; color: #64748b;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #0f172a;">$${Number(item.price || 0).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Order Confirmation</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Damascus University Ecommerce Platform</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #334155; margin-top: 0;">
          Hello <strong>${userName || 'Valued Customer'}</strong>,
        </p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
          Thank you for your order! We have successfully received your order <strong>#${orderId}</strong> and it is now being processed.
        </p>

        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b;">
            <span>Order ID:</span> <strong style="color: #0f172a;">#${orderId}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b;">
            <span>Order Date:</span> <strong style="color: #0f172a;">${formattedDate}</strong>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 12px;">Item</th>
              <th style="padding: 10px 12px; text-align: center;">Qty</th>
              <th style="padding: 10px 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="3" style="padding: 12px; text-align: center;">Standard Order Items</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 16px 12px; font-weight: 700; font-size: 16px; color: #0f172a; text-align: right;">Total Amount:</td>
              <td style="padding: 16px 12px; font-weight: 700; font-size: 18px; color: #2563eb; text-align: right;">$${Number(totalPrice || 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
          <p style="margin: 0;">This email was sent asynchronously via RabbitMQ Background Worker.</p>
          <p style="margin: 4px 0 0;">Damascus University - Faculty of Information Technology Engineering © 2026</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Start the independent RabbitMQ consumer worker.
 */
async function startEmailWorker() {
  console.log('================================================================================');
  console.log('   🚀 RABBITMQ ASYNCHRONOUS EMAIL WORKER STARTING...');
  console.log('================================================================================');

  try {
    const channel = await connectRabbitMQ();

    // Prefetch: Process 1 message at a time per worker for fair dispatch
    await channel.prefetch(1);

    console.log(`👷 [EmailWorker] Listening on queue: "${TOPOLOGY.QUEUE}"`);
    console.log(`🛡️ [EmailWorker] Dead Letter Queue active: "${TOPOLOGY.DLQ_QUEUE}" via "${TOPOLOGY.DLX_EXCHANGE}"`);
    console.log('⏳ [EmailWorker] Waiting for messages. To exit press CTRL+C\n');

    // Consume from order_email_queue with manual acknowledgment (noAck: false)
    channel.consume(
      TOPOLOGY.QUEUE,
      async (msg) => {
        if (!msg) return;

        let payload;
        try {
          payload = JSON.parse(msg.content.toString());
        } catch (parseErr) {
          console.error('❌ [EmailWorker] Malformed JSON payload. Moving directly to DLQ:', parseErr.message);
          channel.nack(msg, false, false);
          return;
        }

        const headers = msg.properties.headers || {};
        const retryCount = headers['x-retry-count'] || 0;
        const { orderId, userEmail } = payload;

        console.log(`\n📥 [EmailWorker] Received Job -> Order #${orderId} (Recipient: ${userEmail}, Attempt: ${retryCount + 1}/${MAX_RETRIES})`);

        try {
          // If the test account dlq/trigger-dlq is used, simulate external mail service failure to demonstrate DLQ
          if (userEmail && (userEmail.includes('trigger-dlq') || userEmail.includes('fail-dlq'))) {
            throw new Error('550 5.1.1 Recipient mailbox unavailable / simulated external SMTP rejection');
          }

          // 1. Send the real email via Nodemailer external SMTP service
          const htmlContent = buildOrderEmailHtml(payload);
          await sendEmail({
            email: userEmail,
            subject: `Order Confirmation #${orderId} - Damascus University Ecommerce`,
            html: htmlContent,
          });

          // 2. CRITICAL: Acknowledge (ACK) ONLY after successful email delivery!
          channel.ack(msg);
          console.log(`✅ [EmailWorker] Email delivered & ACK sent for Order #${orderId}`);
        } catch (err) {
          console.error(`⚠️ [EmailWorker] Failed to send email for Order #${orderId}:`, err.message);

          if (retryCount + 1 < MAX_RETRIES) {
            // 3. Retry Strategy: Re-publish with incremented retry count
            console.log(`🔄 [EmailWorker] Retrying job for Order #${orderId} (Scheduled attempt ${retryCount + 2}/${MAX_RETRIES})...`);

            channel.publish(
              TOPOLOGY.EXCHANGE,
              TOPOLOGY.ROUTING_KEY,
              msg.content,
              {
                persistent: true,
                contentType: 'application/json',
                headers: {
                  ...headers,
                  'x-retry-count': retryCount + 1,
                  'x-last-error': err.message,
                },
              }
            );

            // Acknowledge the failed current copy since a fresh retry was published
            channel.ack(msg);
          } else {
            // 4. Max Retries Exceeded -> Send to Dead Letter Queue (DLQ)
            console.error(`💀 [EmailWorker] Max retries (${MAX_RETRIES}) exceeded for Order #${orderId}!`);
            console.error(`📦 [EmailWorker] Moving message to Dead Letter Queue (DLQ: "${TOPOLOGY.DLQ_QUEUE}") via DLX!`);

            // By rejecting with requeue=false, RabbitMQ routes the message directly into the DLX!
            channel.nack(msg, false, false);

            // 5. Notify user of email issue (without cancelling order or rolling back stock)
            if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
              notifyEmailDeliveryFailure(orderId, userEmail)
                .catch((e) => console.error('Notification error:', e.message));
            }
          }
        }
      },
      { noAck: false } // Enforces Manual Acknowledgment
    );
  } catch (err) {
    console.error('💥 [EmailWorker] Fatal startup error:', err.message);
    setTimeout(startEmailWorker, 5000); // Auto-reconnect after 5s if broker is restarting
  }
}

// Start worker if executed directly from CLI
if (require.main === module) {
  startEmailWorker();
}

module.exports = {
  startEmailWorker,
  buildOrderEmailHtml,
  notifyEmailDeliveryFailure,
};
