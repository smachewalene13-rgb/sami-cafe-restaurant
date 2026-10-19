import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';
import { emitLowStock } from '../sockets/index.js';

export const getIngredients = async (req, res) => {
  try {
    const result = await query(
      `SELECT i.id, i.name, i.unit, i.stock_qty::float as "stockQty",
              i.reorder_level::float as "reorderLevel",
              s.name as "supplierName", s.phone as "supplierPhone"
       FROM ingredients i
       LEFT JOIN suppliers s ON s.id = i.supplier_id
       ORDER BY (i.stock_qty <= i.reorder_level) DESC, i.name ASC`
    );
    return apiResponse(res, 200, 'Ingredients fetched', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getLowStock = async (req, res) => {
  try {
    const result = await query(
      `SELECT i.id, i.name, i.unit, i.stock_qty::float as "stockQty",
              i.reorder_level::float as "reorderLevel",
              s.name as "supplierName", s.phone as "supplierPhone"
       FROM ingredients i
       LEFT JOIN suppliers s ON s.id = i.supplier_id
       WHERE i.stock_qty <= i.reorder_level
       ORDER BY (i.reorder_level - i.stock_qty) DESC`
    );
    return apiResponse(res, 200, 'Low stock items', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const recordStockIn = async (req, res) => {
  try {
    const { ingredientId, quantity, reason = 'Restock Purchase' } = req.body;
    if (!ingredientId || !quantity) {
      return apiError(res, 400, 'ingredientId and quantity are required');
    }

    const numQty = parseFloat(quantity);
    const updateRes = await query(
      `UPDATE ingredients
       SET stock_qty = stock_qty + $1
       WHERE id = $2
       RETURNING id, name, unit, stock_qty::float as "stockQty", reorder_level::float as "reorderLevel"`,
      [numQty, ingredientId]
    );

    if (updateRes.rows.length === 0) return apiError(res, 404, 'Ingredient not found');

    await query(
      `INSERT INTO stock_movements (ingredient_id, change_qty, reason, created_by)
       VALUES ($1, $2, $3, $4)`,
      [ingredientId, numQty, reason, req.user ? req.user.id : null]
    );

    const ingredient = updateRes.rows[0];
    if (ingredient.stockQty <= ingredient.reorderLevel) {
      emitLowStock(ingredient);
    }

    return apiResponse(res, 200, 'Stock restocked successfully', ingredient);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const createIngredient = async (req, res) => {
  try {
    const { name, unit, stockQty = 0, reorderLevel = 10, supplierId } = req.body;
    if (!name || !unit) return apiError(res, 400, 'Name and unit are required');

    const result = await query(
      `INSERT INTO ingredients (name, unit, stock_qty, reorder_level, supplier_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, unit, stock_qty::float as "stockQty", reorder_level::float as "reorderLevel"`,
      [name.trim(), unit.trim(), parseFloat(stockQty), parseFloat(reorderLevel), supplierId || null]
    );

    return apiResponse(res, 201, 'Ingredient added', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};
