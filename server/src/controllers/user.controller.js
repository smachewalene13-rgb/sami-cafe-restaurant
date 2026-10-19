import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, full_name as "fullName", email, phone, role, is_active as "isActive", created_at as "createdAt" FROM users';
    let values = [];

    if (role) {
      sql += ' WHERE role = $1';
      values.push(role);
    }
    sql += ' ORDER BY id ASC';

    const result = await query(sql, values);
    return apiResponse(res, 200, 'Users fetched', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, role = 'waiter', password = 'password123' } = req.body;
    if (!fullName || !email) return apiError(res, 400, 'Full name and email are required');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name as "fullName", email, phone, role, is_active as "isActive", created_at as "createdAt"`,
      [fullName.trim(), email.toLowerCase().trim(), phone || null, passwordHash, role]
    );

    return apiResponse(res, 201, 'User created', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const updateUserRoleOrStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const result = await query(
      `UPDATE users
       SET role = COALESCE($1, role),
           is_active = COALESCE($2, is_active),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, full_name as "fullName", email, phone, role, is_active as "isActive"`,
      [role, isActive, id]
    );

    if (result.rows.length === 0) return apiError(res, 404, 'User not found');
    return apiResponse(res, 200, 'User updated', result.rows[0]);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return apiError(res, 400, 'Cannot delete yourself');
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return apiResponse(res, 200, 'User removed');
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
