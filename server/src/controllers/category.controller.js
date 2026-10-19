import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const getCategories = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.description, c.image_url as "imageUrl", c.sort_order as "sortOrder", c.is_active as "isActive",
              COUNT(m.id)::int as "itemCount"
       FROM categories c
       LEFT JOIN menu_items m ON m.category_id = c.id AND m.is_available = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    return apiResponse(res, 200, 'Categories retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.description, c.image_url as "imageUrl", c.sort_order as "sortOrder", c.is_active as "isActive",
              COUNT(m.id)::int as "itemCount"
       FROM categories c
       LEFT JOIN menu_items m ON m.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    return apiResponse(res, 200, 'All categories retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, sortOrder, isActive } = req.body;
    if (!name) return apiError(res, 400, 'Category name is required');

    const result = await query(
      `INSERT INTO categories (name, description, image_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, COALESCE($5, TRUE))
       RETURNING id, name, description, image_url as "imageUrl", sort_order as "sortOrder", is_active as "isActive"`,
      [name.trim(), description || null, imageUrl || null, sortOrder || 0, isActive]
    );
    return apiResponse(res, 201, 'Category created', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, sortOrder, isActive } = req.body;

    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           sort_order = COALESCE($4, sort_order),
           is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING id, name, description, image_url as "imageUrl", sort_order as "sortOrder", is_active as "isActive"`,
      [name, description, imageUrl, sortOrder, isActive, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Category not found');
    return apiResponse(res, 200, 'Category updated', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if category has items
    const check = await query('SELECT COUNT(*)::int as count FROM menu_items WHERE category_id = $1', [id]);
    if (check.rows[0].count > 0) {
      return apiError(res, 400, 'Cannot delete category that contains menu items');
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return apiError(res, 404, 'Category not found');
    return apiResponse(res, 200, 'Category deleted', { id });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
