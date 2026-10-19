import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const getSettings = async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM settings');
    const settingsObj = result.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    return apiResponse(res, 200, 'Settings retrieved', settingsObj);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = req.body; // e.g. { tax_rate: '0.15', delivery_fee: '120.00', ... }

    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2`,
        [key, String(value)]
      );
    }

    const updated = await query('SELECT key, value FROM settings');
    const settingsObj = updated.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return apiResponse(res, 200, 'Settings updated successfully', settingsObj);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const getNotificationLogs = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, channel, recipient, event_type as "eventType", message, status, error_message as "errorMessage", created_at as "createdAt" FROM notifications_log ORDER BY created_at DESC LIMIT 50'
    );
    return apiResponse(res, 200, 'Notification logs retrieved', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const sendTestTelegram = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const testMsg = message || `🔔 <b>Sami Cafe Notification Test</b>\nThis is a verification ping from Sami Cafe & Restaurant Control Hub. Telegram alert dispatch is working perfectly! ✨`;
    const { sendTelegramMessage } = await import('../services/notification.service.js');
    const result = await sendTelegramMessage(testMsg, chatId || null);
    if (!result.success) {
      return apiError(res, 400, result.error || 'Failed to dispatch Telegram test. Ensure Bot Token & Chat ID are saved.');
    }
    return apiResponse(res, 200, 'Test message sent to Telegram successfully!', result);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const sendTestSms = async (req, res) => {
  try {
    const { phone, message } = req.body;
    const testPhone = phone || '+251911111111';
    const testMsg = message || `[Sami Cafe] Test SMS alert: Your notification system is active. Thank you!`;
    const { sendSmsMessage } = await import('../services/notification.service.js');
    const result = await sendSmsMessage(testPhone, testMsg, 'manual_test');
    return apiResponse(res, 200, `Test SMS dispatched successfully (${result.simulated ? 'Simulated Log' : 'Live Carrier'})!`, result);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};
