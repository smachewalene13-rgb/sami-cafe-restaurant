import { pool, query } from '../config/db.js';
import { emitNewOrder, emitOrderStatus } from '../sockets/index.js';
import { notifyOrderEvent } from './notification.service.js';

export const createOrder = async (userId, { items, order_type, table_id, address, notes, promo_code }) => {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ids = items.map(i => i.menu_item_id);
    const { rows: dishes } = await client.query(
      'SELECT id, name, price FROM menu_items WHERE id = ANY($1) AND is_available = TRUE',
      [ids]
    );

    if (dishes.length !== ids.length) {
      throw new Error('Some selected items are currently unavailable');
    }

    const priceOf = Object.fromEntries(dishes.map(d => [d.id, Number(d.price)]));
    const subtotal = items.reduce((s, i) => s + priceOf[i.menu_item_id] * i.quantity, 0);

    // Check promo code if supplied
    let discount = 0;
    if (promo_code) {
      const promoRes = await client.query(
        'SELECT * FROM promo_codes WHERE code = $1 AND is_active = TRUE AND (ends_at IS NULL OR ends_at > NOW())',
        [promo_code.toUpperCase().trim()]
      );
      if (promoRes.rows.length > 0) {
        const promo = promoRes.rows[0];
        if (subtotal >= Number(promo.min_order)) {
          if (promo.discount_type === 'percentage') {
            discount = Number((subtotal * (Number(promo.value) / 100)).toFixed(2));
          } else {
            discount = Math.min(Number(promo.value), subtotal);
          }
          await client.query('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1', [promo.id]);
        }
      }
    }

    // Delivery fee
    let deliveryFee = 0;
    if (order_type === 'delivery') {
      const settingRes = await client.query("SELECT value FROM settings WHERE key = 'delivery_fee'");
      deliveryFee = settingRes.rows.length > 0 ? Number(settingRes.rows[0].value) : 120.00;
    }

    // Tax rate (15% by default)
    const taxSettingRes = await client.query("SELECT value FROM settings WHERE key = 'tax_rate'");
    const taxRate = taxSettingRes.rows.length > 0 ? Number(taxSettingRes.rows[0].value) : 0.15;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * taxRate).toFixed(2));
    const total = Number((taxableAmount + tax + deliveryFee).toFixed(2));

    const orderNo = 'SC-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Date.now().toString().slice(-4);

    const { rows: [order] } = await client.query(
      `INSERT INTO orders (order_number, user_id, table_id, order_type, status, subtotal, tax, delivery_fee, discount, total, delivery_address, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [orderNo, userId || null, table_id || null, order_type, subtotal, tax, deliveryFee, discount, total, address || null, notes || null]
    );

    // If dine-in and table_id was given, mark table occupied
    if (table_id) {
      await client.query("UPDATE restaurant_tables SET status = 'occupied' WHERE id = $1", [table_id]);
    }

    // Insert order items
    const insertedItems = [];
    for (const i of items) {
      const { rows: [itemRow] } = await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, special_note)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [order.id, i.menu_item_id, i.quantity, priceOf[i.menu_item_id], i.special_note || null]
      );
      insertedItems.push(itemRow);
    }

    await client.query('COMMIT');

    const fullOrder = { ...order, items: insertedItems };
    emitNewOrder(fullOrder);
    notifyOrderEvent(fullOrder, false).catch(console.error);
    return fullOrder;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const isNum = /^\d+$/.test(String(orderId).trim());
  const { rows: [existing] } = await query(
    isNum ? 'SELECT * FROM orders WHERE id = $1' : 'SELECT * FROM orders WHERE order_number = $1',
    [isNum ? parseInt(orderId, 10) : String(orderId).trim()]
  );
  if (!existing) throw new Error('Order not found');

  const resolvedOrderId = existing.id;

  // Deduction of inventory when completed
  if (newStatus === 'completed' && existing.status !== 'completed') {
    // Deduct stock for all items
    const itemsRes = await query(
      `SELECT oi.quantity, ri.ingredient_id, ri.qty_used
       FROM order_items oi
       JOIN recipe_items ri ON ri.menu_item_id = oi.menu_item_id
       WHERE oi.order_id = $1`,
      [resolvedOrderId]
    );

    for (const row of itemsRes.rows) {
      const deductAmount = row.quantity * row.qty_used;
      await query(
        'UPDATE ingredients SET stock_qty = GREATEST(0, stock_qty - $1) WHERE id = $2',
        [deductAmount, row.ingredient_id]
      );
      await query(
        `INSERT INTO stock_movements (ingredient_id, change_qty, reason)
         VALUES ($1, $2, $3)`,
        [row.ingredient_id, -deductAmount, `Order #${existing.order_number}`]
      );
    }

    // If dine-in, free table
    if (existing.table_id) {
      await query("UPDATE restaurant_tables SET status = 'cleaning' WHERE id = $1", [existing.table_id]);
    }
  }

  const result = await query(
    `UPDATE orders
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newStatus, resolvedOrderId]
  );

  const updatedOrder = result.rows[0];
  emitOrderStatus(updatedOrder);
  notifyOrderEvent(updatedOrder, true).catch(console.error);
  return updatedOrder;
};

export const cancelOrder = async (orderId, userId, userRole) => {
  const isNum = /^\d+$/.test(String(orderId).trim());
  const { rows: [order] } = await query(
    isNum ? 'SELECT * FROM orders WHERE id = $1' : 'SELECT * FROM orders WHERE order_number = $1',
    [isNum ? parseInt(orderId, 10) : String(orderId).trim()]
  );
  if (!order) throw new Error('Order not found');

  if (userRole === 'customer' && order.user_id !== userId) {
    throw new Error('Unauthorized to cancel this order');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new Error('Order cannot be cancelled once preparation has started');
  }

  const result = await query(
    "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
    [order.id]
  );

  if (order.table_id) {
    await query("UPDATE restaurant_tables SET status = 'free' WHERE id = $1", [order.table_id]);
  }

  const cancelledOrder = result.rows[0];
  emitOrderStatus(cancelledOrder);
  return cancelledOrder;
};
