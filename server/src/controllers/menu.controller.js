import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';
import { getPagination, getPagingData } from '../utils/pagination.js';

export const getMenuItems = async (req, res) => {
  try {
    const { categoryId, q, vegetarian, fasting, minPrice, maxPrice, isAvailable, page = 1, limit = 20, sort = 'default' } = req.query;

    let conditions = [];
    let values = [];
    let idx = 1;

    // Only filter is_available if specified, default public to TRUE unless admin requests all
    if (isAvailable !== undefined) {
      conditions.push(`m.is_available = $${idx++}`);
      values.push(isAvailable === 'true');
    }

    if (categoryId) {
      conditions.push(`m.category_id = $${idx++}`);
      values.push(parseInt(categoryId, 10));
    }

    if (q && q.trim()) {
      conditions.push(`(m.name ILIKE $${idx} OR m.description ILIKE $${idx})`);
      values.push(`%${q.trim()}%`);
      idx++;
    }

    if (vegetarian === 'true') {
      conditions.push(`m.is_vegetarian = TRUE`);
    }

    if (fasting === 'true') {
      conditions.push(`m.is_fasting = TRUE`);
    }

    if (minPrice) {
      conditions.push(`m.price >= $${idx++}`);
      values.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push(`m.price <= $${idx++}`);
      values.push(parseFloat(maxPrice));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countRes = await query(`SELECT COUNT(*) FROM menu_items m ${whereClause}`, values);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    const { limit: pLimit, offset, page: pPage } = getPagination(page, limit);

    let orderBy = 'm.id ASC';
    if (sort === 'price_asc') orderBy = 'm.price ASC';
    if (sort === 'price_desc') orderBy = 'm.price DESC';
    if (sort === 'name') orderBy = 'm.name ASC';

    const sql = `
      SELECT m.id, m.category_id as "categoryId", c.name as "categoryName",
             m.name, m.description, m.price::float, m.image_url as "imageUrl",
             m.is_available as "isAvailable", m.is_vegetarian as "isVegetarian",
             m.is_fasting as "isFasting", m.prep_minutes as "prepMinutes",
             COALESCE(AVG(r.rating), 5.0)::numeric(2,1) as "avgRating",
             COUNT(r.id)::int as "reviewCount"
      FROM menu_items m
      JOIN categories c ON c.id = m.category_id
      LEFT JOIN reviews r ON r.menu_item_id = m.id
      ${whereClause}
      GROUP BY m.id, c.name
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(pLimit, offset);
    const result = await query(sql, values);

    return apiResponse(res, 200, 'Menu items retrieved', getPagingData(result.rows, totalItems, pPage, pLimit));
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const itemRes = await query(
      `SELECT m.id, m.category_id as "categoryId", c.name as "categoryName",
              m.name, m.description, m.price::float, m.image_url as "imageUrl",
              m.is_available as "isAvailable", m.is_vegetarian as "isVegetarian",
              m.is_fasting as "isFasting", m.prep_minutes as "prepMinutes",
              m.created_at as "createdAt"
       FROM menu_items m
       JOIN categories c ON c.id = m.category_id
       WHERE m.id = $1`,
      [id]
    );

    if (itemRes.rows.length === 0) {
      return apiError(res, 404, 'Menu item not found');
    }

    const reviewsRes = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at as "createdAt",
              u.full_name as "userName"
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.menu_item_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    const item = itemRes.rows[0];
    item.reviews = reviewsRes.rows;
    item.avgRating = reviewsRes.rows.length > 0 
      ? Number((reviewsRes.rows.reduce((acc, r) => acc + r.rating, 0) / reviewsRes.rows.length).toFixed(1))
      : 5.0;

    return apiResponse(res, 200, 'Item retrieved', item);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, imageUrl, isAvailable, isVegetarian, isFasting, prepMinutes } = req.body;
    if (!categoryId || !name || price === undefined) {
      return apiError(res, 400, 'Category, name, and price are required');
    }

    // If an uploaded file is present:
    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await query(
      `INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_vegetarian, is_fasting, prep_minutes)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE), COALESCE($7, FALSE), COALESCE($8, FALSE), COALESCE($9, 15))
       RETURNING id, category_id as "categoryId", name, description, price::float, image_url as "imageUrl",
                 is_available as "isAvailable", is_vegetarian as "isVegetarian", is_fasting as "isFasting", prep_minutes as "prepMinutes"`,
      [categoryId, name.trim(), description || null, parseFloat(price), finalImageUrl || null, isAvailable, isVegetarian, isFasting, prepMinutes]
    );

    return apiResponse(res, 201, 'Menu item created successfully', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, imageUrl, isAvailable, isVegetarian, isFasting, prepMinutes } = req.body;

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await query(
      `UPDATE menu_items
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           image_url = COALESCE($5, image_url),
           is_available = COALESCE($6, is_available),
           is_vegetarian = COALESCE($7, is_vegetarian),
           is_fasting = COALESCE($8, is_fasting),
           prep_minutes = COALESCE($9, prep_minutes),
           updated_at = NOW()
       WHERE id = $10
       RETURNING id, category_id as "categoryId", name, description, price::float, image_url as "imageUrl",
                 is_available as "isAvailable", is_vegetarian as "isVegetarian", is_fasting as "isFasting", prep_minutes as "prepMinutes"`,
      [categoryId, name, description, price ? parseFloat(price) : null, finalImageUrl, isAvailable, isVegetarian, isFasting, prepMinutes, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Menu item not found');
    return apiResponse(res, 200, 'Menu item updated', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const toggleItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const result = await query(
      `UPDATE menu_items
       SET is_available = COALESCE($1, NOT is_available),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, is_available as "isAvailable"`,
      [isAvailable, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'Menu item not found');
    return apiResponse(res, 200, `Item availability updated to ${result.rows[0].isAvailable}`, result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return apiError(res, 404, 'Menu item not found');
    return apiResponse(res, 200, 'Menu item deleted', { id });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
