-- ============================================================
-- SAMI CAFE AND RESTAURANT DATABASE SCHEMA
-- PostgreSQL 15+ compatible
-- ============================================================

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS table_status CASCADE;
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE;

CREATE TYPE user_role AS ENUM ('customer','waiter','kitchen','cashier','manager','admin');
CREATE TYPE order_type AS ENUM ('dine_in','takeaway','delivery');
CREATE TYPE order_status AS ENUM ('pending','confirmed','preparing','ready','out_for_delivery','completed','cancelled');
CREATE TYPE payment_method AS ENUM ('cash','card','mobile_money','online');
CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE table_status AS ENUM ('free','occupied','reserved','cleaning');
CREATE TYPE reservation_status AS ENUM ('pending','confirmed','cancelled','completed','no_show');
CREATE TYPE discount_type AS ENUM ('percentage','fixed');

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(25),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) DEFAULT 'Addis Ababa',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_fasting BOOLEAN DEFAULT FALSE,
  prep_minutes INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESTAURANT TABLES
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id SERIAL PRIMARY KEY,
  table_number VARCHAR(10) UNIQUE NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  location VARCHAR(50) DEFAULT 'Main Dining',
  status table_status DEFAULT 'free'
);

-- 6. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  table_id INT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  guest_name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT DEFAULT 90,
  guests INT NOT NULL CHECK (guests > 0),
  status reservation_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  table_id INT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  order_type order_type NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  special_note TEXT
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method payment_method NOT NULL DEFAULT 'cash',
  amount NUMERIC(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_ref VARCHAR(100),
  paid_at TIMESTAMPTZ
);

-- 10. PROMO CODES
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order NUMERIC(10,2) DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  usage_limit INT DEFAULT 100,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 11. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INGREDIENTS
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  stock_qty NUMERIC(10,2) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(10,2) NOT NULL DEFAULT 10,
  supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. RECIPE ITEMS
CREATE TABLE IF NOT EXISTS recipe_items (
  id SERIAL PRIMARY KEY,
  menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty_used NUMERIC(10,3) NOT NULL,
  UNIQUE(menu_item_id, ingredient_id)
);

-- 15. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  change_qty NUMERIC(10,2) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50),
  entity_id INT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS notifications_log (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(20) NOT NULL,
  recipient VARCHAR(150) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date, start_time);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
