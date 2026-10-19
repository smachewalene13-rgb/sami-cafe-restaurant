import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Today's sales and order count
    const todaySalesRes = await query(
      `SELECT COALESCE(SUM(total), 0)::float as "todayRevenue",
              COUNT(id)::int as "todayOrders"
       FROM orders
       WHERE status NOT IN ('cancelled') AND DATE(created_at) = CURRENT_DATE`
    );

    // 2. Active tables
    const tableRes = await query(
      `SELECT COUNT(*)::int as "occupiedTables",
              (SELECT COUNT(*)::int FROM restaurant_tables) as "totalTables"
       FROM restaurant_tables
       WHERE status = 'occupied'`
    );

    // 3. Upcoming reservations for today
    const resRes = await query(
      `SELECT COUNT(*)::int as "upcomingReservations"
       FROM reservations
       WHERE reservation_date = CURRENT_DATE AND status IN ('pending', 'confirmed')`
    );

    // 4. Low stock count
    const stockRes = await query(
      `SELECT COUNT(*)::int as "lowStockCount"
       FROM ingredients
       WHERE stock_qty <= reorder_level`
    );

    // 5. Total all-time revenue
    const totalSalesRes = await query(
      `SELECT COALESCE(SUM(total), 0)::float as "totalRevenue",
              COUNT(id)::int as "totalOrders"
       FROM orders
       WHERE status = 'completed'`
    );

    return apiResponse(res, 200, 'Dashboard summary', {
      todayRevenue: todaySalesRes.rows[0].todayRevenue,
      todayOrders: todaySalesRes.rows[0].todayOrders,
      occupiedTables: tableRes.rows[0].occupiedTables,
      totalTables: tableRes.rows[0].totalTables,
      upcomingReservations: resRes.rows[0].upcomingReservations,
      lowStockCount: stockRes.rows[0].lowStockCount,
      totalRevenue: totalSalesRes.rows[0].totalRevenue,
      totalOrders: totalSalesRes.rows[0].totalOrders
    });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // 'day', 'week', 'month'

    let interval = "7 days";
    let dateFormat = "YYYY-MM-DD";

    if (period === 'month') {
      interval = "30 days";
    }

    const salesSql = `
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as "date",
             COALESCE(SUM(total), 0)::float as "revenue",
             COUNT(id)::int as "orderCount"
      FROM orders
      WHERE status NOT IN ('cancelled')
        AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY "date" ASC
    `;

    const result = await query(salesSql);
    return apiResponse(res, 200, 'Sales report', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getTopItems = async (req, res) => {
  try {
    const result = await query(
      `SELECT m.id, m.name, m.image_url as "imageUrl", c.name as "categoryName",
              SUM(oi.quantity)::int as "totalSold",
              SUM(oi.quantity * oi.unit_price)::float as "totalRevenue"
       FROM order_items oi
       JOIN menu_items m ON m.id = oi.menu_item_id
       JOIN categories c ON c.id = m.category_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status NOT IN ('cancelled')
       GROUP BY m.id, m.name, m.image_url, c.name
       ORDER BY "totalSold" DESC
       LIMIT 10`
    );

    return apiResponse(res, 200, 'Top selling items', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};
