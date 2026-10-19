-- ============================================================
-- SAMI CAFE AND RESTAURANT SEED DATA
-- Default password for all seed accounts is: password123
-- Hash: $2b$10$epRfZG9hZ17l029mJqEgeuxFqK3c.yWzK17e2D48c5a2H7W6lAie2 (or handled in JS seed)
-- ============================================================

-- Clean up existing data
TRUNCATE TABLE audit_logs, stock_movements, recipe_items, ingredients, suppliers, reviews,
               promo_codes, payments, order_items, orders, reservations, restaurant_tables,
               menu_items, categories, addresses, users, settings CASCADE;

-- Default Settings
INSERT INTO settings (key, value) VALUES
  ('restaurant_name', 'Sami Cafe and Restaurant'),
  ('tagline', 'Authentic Ethiopian Hospitality & Modern Gourmet Cuisine'),
  ('restaurant_phone', '+251 911 234 567'),
  ('restaurant_email', 'contact@samicafe.com'),
  ('restaurant_address', 'Bole Medhanialem, Camen Avenue, Addis Ababa, Ethiopia'),
  ('opening_hours', 'Monday - Sunday: 07:00 AM - 11:00 PM'),
  ('tax_rate', '0.15'),
  ('delivery_fee', '120.00'),
  ('currency', 'ETB'),
  ('auto_confirm_reservations', 'true');

-- Users
-- Password for all users: password123
INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar_url, is_active) VALUES
  (1, 'Simachew Alene (Owner)', 'admin@samicafe.com', '+251911111111', '$2a$10$wNlWF.silesr8P2YN7ow2OOMOJY4H5heRtKFG5CSLuwAZt4jic3LW', 'admin', '/images/simachew-profile.png', TRUE),
  (2, 'Helen Tesfaye', 'manager@samicafe.com', '+251922222222', '$2a$10$wNlWF.silesr8P2YN7ow2OOMOJY4H5heRtKFG5CSLuwAZt4jic3LW', 'manager', NULL, TRUE),
  (3, 'Dawit Alemu', 'waiter@samicafe.com', '+251933333333', '$2a$10$wNlWF.silesr8P2YN7ow2OOMOJY4H5heRtKFG5CSLuwAZt4jic3LW', 'waiter', NULL, TRUE),
  (4, 'Chef Martha Girma', 'kitchen@samicafe.com', '+251944444444', '$2a$10$wNlWF.silesr8P2YN7ow2OOMOJY4H5heRtKFG5CSLuwAZt4jic3LW', 'kitchen', NULL, TRUE),
  (5, 'Abebe Bekele', 'cashier@samicafe.com', '+251955555555', '$2a$10$wNlWF.silesr8P2YN7ow2OOMOJY4H5heRtKFG5CSLuwAZt4jic3LW', 'cashier', NULL, TRUE),
  (6, 'Bethelhem Tadesse', 'customer@samicafe.com', '+251966666666', '$2a$10$wNlWF.silesr8P2YN7ow2OOMOJY4H5heRtKFG5CSLuwAZt4jic3LW', 'customer', NULL, TRUE);

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Customer Address
INSERT INTO addresses (user_id, label, street, city, notes) VALUES
  (6, 'Apartment', 'Bole Atlas, Street 4, Bldg 12, Apt 401', 'Addis Ababa', 'Near Atlas Hotel');

-- Categories
INSERT INTO categories (id, name, description, image_url, sort_order, is_active) VALUES
  (1, 'Breakfast', 'Energizing traditional and continental breakfast dishes', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop', 1, TRUE),
  (2, 'Coffee & Tea', 'Single-origin Ethiopian Yirgacheffe & Sidama roast coffees, herbal teas', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop', 2, TRUE),
  (3, 'Fresh Juices', '100% freshly pressed fruits, specialty Spris layered juice', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop', 3, TRUE),
  (4, 'Main Dishes', 'Signature Ethiopian beef, lamb dishes, Derek Tibs, and Doro Wat', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop', 4, TRUE),
  (5, 'Fasting Food (Tsom)', 'Exquisite traditional vegan dishes served on Injera', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop', 5, TRUE),
  (6, 'Pizza & Pasta', 'Artisanal stone-baked pizza and handmade Italian pasta', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop', 6, TRUE),
  (7, 'Desserts & Pastries', 'Decadent cakes, traditional baklava, and fresh pastries', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop', 7, TRUE);

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Menu Items
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_available, is_vegetarian, is_fasting, prep_minutes) VALUES
  -- Breakfast
  (1, 1, 'Traditional Chechebsa', 'Tender shredded flatbread tossed in spiced clarified butter (kibe) and berbere, with fresh honey and yogurt.', 280.00, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop', TRUE, TRUE, FALSE, 12),
  (2, 1, 'Special Ful with Eggs & Feta', 'Slow-cooked spiced fava beans topped with scrambled eggs, fresh tomato salsa, jalapeño, and crumbled feta with toasted bread.', 320.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop', TRUE, TRUE, FALSE, 15),
  (3, 1, 'Sami Breakfast Platter', 'Eggs cooked to choice, grilled beef sausage, baked beans, sautéed mushrooms, herb hash browns, and sourdough toast.', 450.00, 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop', TRUE, FALSE, FALSE, 18),

  -- Coffee & Tea
  (4, 2, 'Authentic Ethiopian Coffee Ceremony (Jebena)', 'Pot of freshly roasted, crushed, and brewed organic highland beans served with fresh popcorn, frankincense, and rue herb.', 250.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 20),
  (5, 2, 'Special Macchiato', 'The legendary Addis Ababa layered espresso with micro-foamed creamy milk.', 110.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop', TRUE, TRUE, FALSE, 5),
  (6, 2, 'Spiced Chai with Cinnamon & Cardamom', 'Slow-simmered black tea infused with ginger, cloves, cinnamon sticks, and green cardamom pods.', 95.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 8),

  -- Fresh Juices
  (7, 3, 'Signature Spris Juice (Layered)', 'Vibrant layered fresh purees of ripe avocado, sweet mango, and tropical papaya served with fresh lime.', 195.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 8),
  (8, 3, 'Fresh Mango Passion', 'Rich blended Arba Minch mango with a splash of tart passion fruit essence.', 180.00, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 6),

  -- Main Dishes
  (9, 4, 'Sami Special Derek Tibs', 'Sizzling cubed tender beef pan-seared with rosemary, sweet red onions, garlic, and sliced green peppers served on a charcoal clay brazier (shigolo).', 750.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop', TRUE, FALSE, FALSE, 20),
  (10, 4, 'Royal Doro Wat', 'Slow-cooked rich chicken drumstick stew in rich berbere and spiced butter with hard-boiled farm egg and cottage cheese (Ayib).', 820.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop', TRUE, FALSE, FALSE, 25),
  (11, 4, 'Chef Special Kitfo (Leb-Leb)', 'Minced prime lean beef warmed gently with spiced nitir kibe and mitmita, served with Ayib and Gomen.', 780.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop', TRUE, FALSE, FALSE, 15),

  -- Fasting Food (Tsom)
  (12, 5, 'Grand Beyaynetu Platter', 'Colorful array of Shiro, spicy Misir Wat, Kik Alicha, braised Gomen, Fosolia green beans, beetroot salad, and fresh salad on teff Injera.', 520.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 15),
  (13, 5, 'Shiro Tegabino in Clay Pot', 'Bubbling chickpea powder stew cooked with garlic, onions, and jalapeños, served boiling hot with rolled Injera.', 390.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 12),

  -- Pizza & Pasta
  (14, 6, 'Sami Gourmet Supreme Pizza', 'Crispy stone-baked crust with smoked beef pepperoni, shredded chicken, bell peppers, Kalamata olives, and fresh mozzarella.', 690.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop', TRUE, FALSE, FALSE, 18),
  (15, 6, 'Truffle Mushroom Tagliatelle', 'Handmade egg pasta tossed with sautéed wild forest mushrooms, garlic cream sauce, and aged parmesan shavings.', 580.00, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop', TRUE, TRUE, FALSE, 16),

  -- Desserts & Pastries
  (16, 7, 'Espresso Tiramisu', 'Classic Italian sponge fingers soaked in our single-origin espresso and layered with mascarpone cream and Valrhona cocoa.', 280.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop', TRUE, TRUE, FALSE, 5),
  (17, 7, 'Artisan Honey Baklava', 'Flaky phyllo pastry layers packed with crushed pistachios, walnuts, and scented with wild honey syrup.', 240.00, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop', TRUE, TRUE, TRUE, 5);

SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));

-- Restaurant Tables
INSERT INTO restaurant_tables (id, table_number, capacity, location, status) VALUES
  (1, 'T-01', 2, 'Coffee Bar Corner', 'free'),
  (2, 'T-02', 2, 'Window View', 'free'),
  (3, 'T-03', 4, 'Main Dining Hall', 'occupied'),
  (4, 'T-04', 4, 'Main Dining Hall', 'free'),
  (5, 'T-05', 6, 'Garden Terrace', 'reserved'),
  (6, 'T-06', 6, 'Garden Terrace', 'free'),
  (7, 'T-07', 8, 'VIP Cultural Lounge', 'free'),
  (8, 'T-08', 4, 'Main Dining Hall', 'cleaning');

SELECT setval('restaurant_tables_id_seq', (SELECT MAX(id) FROM restaurant_tables));

-- Promo Codes
INSERT INTO promo_codes (code, discount_type, value, min_order, usage_limit, used_count, is_active) VALUES
  ('WELCOME10', 'percentage', 10.00, 300.00, 500, 14, TRUE),
  ('SAMIFESTIVE', 'fixed', 150.00, 800.00, 200, 31, TRUE),
  ('COFFEEFREE', 'percentage', 15.00, 400.00, 100, 8, TRUE);

-- Suppliers
INSERT INTO suppliers (id, name, phone, email, address) VALUES
  (1, 'Yirgacheffe Coffee Farmers Coop', '+251 911 888 001', 'info@yirgacoffee.et', 'Dilla, Gedeo Zone'),
  (2, 'Debre Zeit Fresh Dairy & Meats', '+251 911 888 002', 'sales@dzproduce.et', 'Bishoftu Industrial Rd'),
  (3, 'Addis Spice & Injera Mills', '+251 911 888 003', 'supplies@addisspice.et', 'Merkato Gidder, Addis Ababa');

SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

-- Ingredients & Inventory
INSERT INTO ingredients (id, name, unit, stock_qty, reorder_level, supplier_id) VALUES
  (1, 'Single-Origin Coffee Beans (Yirgacheffe Grade 1)', 'kg', 24.50, 10.00, 1),
  (2, 'Tender Beef Prime Cut', 'kg', 45.00, 15.00, 2),
  (3, 'Fresh Farm Eggs', 'pcs', 180.00, 50.00, 2),
  (4, 'Whole Milk', 'liters', 65.00, 20.00, 2),
  (5, 'Organic Berbere Spice Blend', 'kg', 18.00, 5.00, 3),
  (6, 'Avocado (Ripe Hass)', 'kg', 32.00, 12.00, 2),
  (7, 'Mango Puree', 'kg', 28.00, 10.00, 2),
  (8, 'Mozzarella Cheese', 'kg', 6.50, 8.00, 2); -- Below reorder level!

SELECT setval('ingredients_id_seq', (SELECT MAX(id) FROM ingredients));

-- Recipe Items
INSERT INTO recipe_items (menu_item_id, ingredient_id, qty_used) VALUES
  (4, 1, 0.050), -- 50g coffee for Jebena
  (5, 1, 0.018), -- 18g espresso
  (5, 4, 0.120), -- 120ml milk
  (7, 6, 0.150), -- 150g avocado
  (7, 7, 0.150), -- 150g mango
  (9, 2, 0.350), -- 350g beef for Special Tibs
  (9, 5, 0.020), -- 20g berbere
  (14, 8, 0.200); -- 200g mozzarella

-- Sample Orders
INSERT INTO orders (id, order_number, user_id, table_id, order_type, status, subtotal, tax, delivery_fee, discount, total, delivery_address, notes) VALUES
  (1, 'SC-20261001-01', 6, 3, 'dine_in', 'preparing', 1030.00, 154.50, 0.00, 0.00, 1184.50, NULL, 'Extra spicy for tibs'),
  (2, 'SC-20261001-02', 6, NULL, 'delivery', 'out_for_delivery', 885.00, 132.75, 120.00, 50.00, 1087.75, 'Bole Atlas, Street 4, Apt 401', 'Please call upon arrival'),
  (3, 'SC-20261001-03', 6, NULL, 'takeaway', 'completed', 450.00, 67.50, 0.00, 0.00, 517.50, NULL, 'Packed with disposable utensils');

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- Order Items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, special_note) VALUES
  (1, 9, 1, 750.00, 'Medium well, rosemary aroma'),
  (1, 1, 1, 280.00, 'Served with extra honey'),
  (2, 14, 1, 690.00, 'Crispy crust'),
  (2, 7, 1, 195.00, 'Extra fresh lime'),
  (3, 3, 1, 450.00, 'Scrambled eggs');

-- Payments
INSERT INTO payments (order_id, method, amount, status, transaction_ref, paid_at) VALUES
  (1, 'card', 1184.50, 'paid', 'POS-TX-99214', NOW() - INTERVAL '15 minutes'),
  (2, 'mobile_money', 1087.75, 'paid', 'TELEBIRR-883190', NOW() - INTERVAL '30 minutes'),
  (3, 'cash', 517.50, 'paid', 'CASH-REC-1002', NOW() - INTERVAL '1 hour');

-- Sample Reservations
INSERT INTO reservations (user_id, table_id, guest_name, phone, reservation_date, start_time, duration_minutes, guests, status, notes) VALUES
  (6, 5, 'Bethelhem Tadesse', '+251966666666', CURRENT_DATE, '19:30:00', 90, 4, 'confirmed', 'Celebrating anniversary, quiet booth preferred'),
  (NULL, 7, 'Dr. Yohannes Merawi', '+251911998877', CURRENT_DATE + INTERVAL '1 day', '20:00:00', 120, 8, 'pending', 'VIP cultural dinner for visiting delegates');

-- Sample Reviews
INSERT INTO reviews (user_id, menu_item_id, rating, comment) VALUES
  (6, 9, 5, 'The best Special Derek Tibs in Addis Ababa! Tender, hot, and the aroma is unreal.'),
  (6, 4, 5, 'True authentic Jebena coffee experience. Love the popcorn and presentation.'),
  (6, 12, 5, 'Fresh, rich fasting Beyaynetu. The Shiro is unmatched.');
