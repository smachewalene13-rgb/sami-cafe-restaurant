import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

export const registerUser = async ({ fullName, email, phone, password }) => {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  if (existing.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, full_name, email, phone, role, created_at`,
    [fullName.trim(), email.toLowerCase().trim(), phone || null, passwordHash]
  );

  const user = result.rows[0];
  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
    [email.toLowerCase().trim()]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  const safeUser = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatar_url || (user.email === 'admin@samicafe.com' ? '/images/simachew-profile.png' : null),
    createdAt: user.created_at
  };

  return { user: safeUser, token };
};

export const getUserById = async (id) => {
  const result = await query(
    'SELECT id, full_name as "fullName", email, phone, role, avatar_url as "avatarUrl", is_active as "isActive", created_at as "createdAt" FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  const user = result.rows[0];
  if (!user.avatarUrl && user.email === 'admin@samicafe.com') {
    user.avatarUrl = '/images/simachew-profile.png';
  }
  return user;
};

export const updateUserProfile = async (id, { fullName, phone, avatarUrl }) => {
  const result = await query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         phone = COALESCE($2, phone),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, full_name as "fullName", email, phone, role, avatar_url as "avatarUrl"`,
    [fullName, phone, avatarUrl, id]
  );
  return result.rows[0];
};
