import cron from 'node-cron';
import { query } from '../config/db.js';
import { emitLowStock } from '../sockets/index.js';

export const startLowStockCronJob = () => {
  // Check every hour at minute 0: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await query(
        `SELECT id, name, unit, stock_qty::float as "stockQty", reorder_level::float as "reorderLevel"
         FROM ingredients
         WHERE stock_qty <= reorder_level`
      );

      if (result.rows.length > 0) {
        console.log(`[CRON] Found ${result.rows.length} ingredients below reorder level.`);
        result.rows.forEach(item => emitLowStock(item));
      }
    } catch (err) {
      console.error('[CRON Error] Failed low stock check:', err.message);
    }
  });
};
