import * as orderService from '../services/order.service.js';
import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { items, orderType, tableId, address, notes, promoCode } = req.body;

    const order = await orderService.createOrder(userId, {
      items,
      order_type: orderType || 'dine_in',
      table_id: tableId,
      address,
      notes,
      promo_code: promoCode
    });

    return apiResponse(res, 201, 'Order placed successfully', order);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT o.id, o.order_number as "orderNumber", o.order_type as "orderType",
              o.status, o.subtotal::float, o.tax::float, o.delivery_fee as "deliveryFee",
              o.discount::float, o.total::float, o.delivery_address as "deliveryAddress",
              o.notes, o.created_at as "createdAt",
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'menuItemId', oi.menu_item_id,
                    'name', m.name,
                    'imageUrl', m.image_url,
                    'quantity', oi.quantity,
                    'unitPrice', oi.unit_price::float,
                    'specialNote', oi.special_note
                  )
                ) FILTER (WHERE oi.id IS NOT NULL), '[]'
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN menu_items m ON m.id = oi.menu_item_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return apiResponse(res, 200, 'Orders retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();
    const isNumeric = /^\d+$/.test(cleanId);

    const whereClause = isNumeric
      ? 'WHERE o.id = $1 OR o.order_number = $2'
      : 'WHERE o.order_number = $1';
    const params = isNumeric ? [parseInt(cleanId, 10), cleanId] : [cleanId];

    const result = await query(
      `SELECT o.id, o.order_number as "orderNumber", o.user_id as "userId",
              u.full_name as "customerName", u.phone as "customerPhone",
              o.table_id as "tableId", t.table_number as "tableNumber",
              o.order_type as "orderType", o.status,
              o.subtotal::float, o.tax::float, o.delivery_fee as "deliveryFee",
              o.discount::float, o.total::float, o.delivery_address as "deliveryAddress",
              o.notes, o.created_at as "createdAt", o.updated_at as "updatedAt",
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'menuItemId', oi.menu_item_id,
                    'name', m.name,
                    'imageUrl', m.image_url,
                    'quantity', oi.quantity,
                    'unitPrice', oi.unit_price::float,
                    'specialNote', oi.special_note
                  )
                ) FILTER (WHERE oi.id IS NOT NULL), '[]'
              ) as items
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN restaurant_tables t ON t.id = o.table_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN menu_items m ON m.id = oi.menu_item_id
       ${whereClause}
       GROUP BY o.id, u.full_name, u.phone, t.table_number`,
      params
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Order not found');
    return apiResponse(res, 200, 'Order retrieved', result.rows[0]);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, orderType, date } = req.query;

    let conditions = [];
    let values = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.status = $${idx++}`);
      values.push(status);
    }

    if (orderType) {
      conditions.push(`o.order_type = $${idx++}`);
      values.push(orderType);
    }

    if (date) {
      conditions.push(`DATE(o.created_at) = $${idx++}`);
      values.push(date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT o.id, o.order_number as "orderNumber", o.user_id as "userId",
             u.full_name as "customerName", u.phone as "customerPhone",
             o.table_id as "tableId", t.table_number as "tableNumber",
             o.order_type as "orderType", o.status,
             o.subtotal::float, o.tax::float, o.delivery_fee as "deliveryFee",
             o.discount::float, o.total::float, o.delivery_address as "deliveryAddress",
             o.notes, o.created_at as "createdAt",
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'menuItemId', oi.menu_item_id,
                   'name', m.name,
                   'quantity', oi.quantity,
                   'unitPrice', oi.unit_price::float,
                   'specialNote', oi.special_note
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) as items
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN restaurant_tables t ON t.id = o.table_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu_items m ON m.id = oi.menu_item_id
      ${whereClause}
      GROUP BY o.id, u.full_name, u.phone, t.table_number
      ORDER BY o.created_at DESC
    `;

    const result = await query(sql, values);
    return apiResponse(res, 200, 'All orders retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return apiError(res, 400, 'New status is required');

    const updated = await orderService.updateOrderStatus(id, status);
    return apiResponse(res, 200, `Order status updated to ${status}`, updated);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const cancelled = await orderService.cancelOrder(id, req.user ? req.user.id : null, req.user ? req.user.role : null);
    return apiResponse(res, 200, 'Order successfully cancelled', cancelled);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};
