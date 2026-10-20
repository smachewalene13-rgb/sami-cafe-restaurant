import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const validatePromo = async (req, res) => {
  try {
    const { code, orderTotal = 0 } = req.body;
    if (!code) return apiError(res, 400, 'Promo code is required');

    const result = await query(
      `SELECT * FROM promo_codes
       WHERE code = $1 AND is_active = TRUE AND (ends_at IS NULL OR ends_at > NOW())`,
      [code.toUpperCase().trim()]
    );

    if (result.rows.length === 0) {
      return apiError(res, 404, 'Invalid or expired promo code');
    }

    const promo = result.rows[0];
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return apiError(res, 400, 'Promo code usage limit has been reached');
    }

    if (Number(orderTotal) < Number(promo.min_order)) {
      return apiError(res, 400, `Minimum order amount of ${promo.min_order} ETB required for this code`);
    }

    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = Number((orderTotal * (Number(promo.value) / 100)).toFixed(2));
    } else {
      discountAmount = Math.min(Number(promo.value), Number(orderTotal));
    }

    return apiResponse(res, 200, 'Promo code applied', {
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: Number(promo.value),
      discountAmount
    });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getAllPromos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM promo_codes ORDER BY id DESC');
    return apiResponse(res, 200, 'Promo codes', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const createPromo = async (req, res) => {
  try {
    const { code, discountType = 'percentage', value, minOrder = 0, endsAt, usageLimit = 100 } = req.body;
    if (!code || !value) return apiError(res, 400, 'Code and discount value are required');

    const result = await query(
      `INSERT INTO promo_codes (code, discount_type, value, min_order, ends_at, usage_limit)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [code.toUpperCase().trim(), discountType, parseFloat(value), parseFloat(minOrder), endsAt || null, parseInt(usageLimit, 10)]
    );

    return apiResponse(res, 201, 'Promo code created', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, endsAt, usageLimit, minOrder } = req.body;

    const result = await query(
      `UPDATE promo_codes
       SET is_active = COALESCE($1, is_active),
           ends_at = COALESCE($2, ends_at),
           usage_limit = COALESCE($3, usage_limit),
           min_order = COALESCE($4, min_order)
       WHERE id = $5
       RETURNING *`,
      [isActive, endsAt, usageLimit, minOrder, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Promo code not found');
    return apiResponse(res, 200, 'Promo updated', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM promo_codes WHERE id = $1', [id]);
    return apiResponse(res, 200, 'Promo deleted');
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
