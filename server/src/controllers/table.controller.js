import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';
import { emitTableUpdate } from '../sockets/index.js';

export const getTables = async (req, res) => {
  try {
    const result = await query(
      `SELECT t.id, t.table_number as "tableNumber", t.capacity, t.location, t.status,
              (
                SELECT json_build_object(
                  'id', o.id,
                  'orderNumber', o.order_number,
                  'status', o.status,
                  'total', o.total::float,
                  'createdAt', o.created_at
                )
                FROM orders o
                WHERE o.table_id = t.id AND o.status NOT IN ('completed', 'cancelled')
                ORDER BY o.created_at DESC
                LIMIT 1
              ) as "activeOrder"
       FROM restaurant_tables t
       ORDER BY t.table_number ASC`
    );
    return apiResponse(res, 200, 'Tables retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ['free', 'occupied', 'reserved', 'cleaning'];
    if (!valid.includes(status)) {
      return apiError(res, 400, `Invalid table status: ${status}. Must be one of: ${valid.join(', ')}`);
    }

    const result = await query(
      `UPDATE restaurant_tables
       SET status = $1
       WHERE id = $2
       RETURNING id, table_number as "tableNumber", capacity, location, status`,
      [status, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Table not found');
    const table = result.rows[0];
    emitTableUpdate(table);
    return apiResponse(res, 200, `Table status updated to ${status}`, table);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, location } = req.body;
    if (!tableNumber || !capacity) {
      return apiError(res, 400, 'Table number and capacity are required');
    }

    const result = await query(
      `INSERT INTO restaurant_tables (table_number, capacity, location, status)
       VALUES ($1, $2, COALESCE($3, 'Main Dining'), 'free')
       RETURNING id, table_number as "tableNumber", capacity, location, status`,
      [tableNumber.trim(), parseInt(capacity, 10), location]
    );

    return apiResponse(res, 201, 'Table created', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, location, status } = req.body;

    const result = await query(
      `UPDATE restaurant_tables
       SET table_number = COALESCE($1, table_number),
           capacity = COALESCE($2, capacity),
           location = COALESCE($3, location),
           status = COALESCE($4, status)
       WHERE id = $5
       RETURNING id, table_number as "tableNumber", capacity, location, status`,
      [tableNumber, capacity ? parseInt(capacity, 10) : null, location, status, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Table not found');
    emitTableUpdate(result.rows[0]);
    return apiResponse(res, 200, 'Table updated', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM restaurant_tables WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return apiError(res, 404, 'Table not found');
    return apiResponse(res, 200, 'Table deleted', { id });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
