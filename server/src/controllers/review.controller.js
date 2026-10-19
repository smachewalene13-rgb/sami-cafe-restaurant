import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuItemId, rating, comment } = req.body;

    if (!menuItemId || !rating) {
      return apiError(res, 400, 'Menu item ID and rating (1-5) are required');
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return apiError(res, 400, 'Rating must be between 1 and 5');
    }

    const result = await query(
      `INSERT INTO reviews (user_id, menu_item_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id as "userId", menu_item_id as "menuItemId", rating, comment, created_at as "createdAt"`,
      [userId, menuItemId, numRating, comment || null]
    );

    return apiResponse(res, 201, 'Thank you! Your review was recorded', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const getItemReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at as "createdAt",
              u.full_name as "userName"
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.menu_item_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    return apiResponse(res, 200, 'Reviews retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
