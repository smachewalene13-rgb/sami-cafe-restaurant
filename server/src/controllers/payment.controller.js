import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';
import { updateOrderStatus } from '../services/order.service.js';

export const initiatePayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) {
      return apiError(res, 400, 'Order ID and payment method are required');
    }

    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) return apiError(res, 404, 'Order not found');
    const order = orderRes.rows[0];

    const ref = `TX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const payRes = await query(
      `INSERT INTO payments (order_id, method, amount, status, transaction_ref)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING *`,
      [orderId, method, order.total, ref]
    );

    // In a real Telebirr / Chapa / Stripe gateway, we generate a payment URL.
    // For simulation & seamless checkout:
    return apiResponse(res, 200, 'Payment initiated', {
      payment: payRes.rows[0],
      paymentUrl: `/orders/${order.id}?pay_ref=${ref}&gateway=${method}`
    });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const recordCashPayment = async (req, res) => {
  try {
    const { orderId, amount, method = 'cash', reference } = req.body;
    if (!orderId || amount === undefined) {
      return apiError(res, 400, 'Order ID and amount are required');
    }

    const ref = reference || `CASH-REC-${Date.now().toString().slice(-4)}`;

    const payRes = await query(
      `INSERT INTO payments (order_id, method, amount, status, transaction_ref, paid_at)
       VALUES ($1, $2, $3, 'paid', $4, NOW())
       RETURNING *`,
      [orderId, method, amount, ref]
    );

    // If order was preparing or ready, keep or advance
    const orderRes = await query('SELECT status FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length > 0 && orderRes.rows[0].status === 'pending') {
      await updateOrderStatus(orderId, 'confirmed');
    }

    return apiResponse(res, 200, 'Payment recorded successfully', payRes.rows[0]);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    const { transaction_ref, status = 'paid' } = req.body;
    if (!transaction_ref) return apiError(res, 400, 'transaction_ref is required');

    const result = await query(
      `UPDATE payments
       SET status = $1, paid_at = NOW()
       WHERE transaction_ref = $2
       RETURNING *`,
      [status, transaction_ref]
    );

    if (result.rows.length > 0) {
      const payment = result.rows[0];
      await updateOrderStatus(payment.order_id, 'confirmed');
    }

    return apiResponse(res, 200, 'Webhook processed', result.rows[0] || null);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
