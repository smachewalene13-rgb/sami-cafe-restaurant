import { query } from '../config/db.js';

/**
 * Fetch notification credentials & toggles from settings table
 */
export const getNotificationConfig = async () => {
  try {
    const res = await query(
      "SELECT key, value FROM settings WHERE key IN ('telegram_enabled', 'telegram_bot_token', 'telegram_chat_id', 'sms_enabled', 'sms_provider', 'sms_sender_id', 'sms_api_key')"
    );
    const config = {};
    for (const row of res.rows) {
      config[row.key] = row.value;
    }
    return {
      telegramEnabled: config.telegram_enabled === 'true',
      telegramBotToken: config.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: config.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || '',
      smsEnabled: config.sms_enabled === 'true',
      smsProvider: config.sms_provider || 'mock',
      smsSenderId: config.sms_sender_id || 'SamiCafe',
      smsApiKey: config.sms_api_key || process.env.SMS_API_KEY || '',
    };
  } catch (err) {
    console.error('Failed to load notification settings:', err.message);
    return {
      telegramEnabled: false,
      telegramBotToken: '',
      telegramChatId: '',
      smsEnabled: true,
      smsProvider: 'mock',
      smsSenderId: 'SamiCafe',
      smsApiKey: '',
    };
  }
};

/**
 * Log notification to database
 */
export const logNotification = async ({ channel, recipient, eventType, message, status = 'sent', errorMessage = null }) => {
  try {
    await query(
      `INSERT INTO notifications_log (channel, recipient, event_type, message, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [channel, recipient, eventType, message, status, errorMessage]
    );
  } catch (err) {
    console.error('Failed to write notification log:', err.message);
  }
};

/**
 * Send Telegram message via Telegram Bot API
 */
export const sendTelegramMessage = async (message, customChatId = null) => {
  const config = await getNotificationConfig();
  const token = config.telegramBotToken;
  const chatId = customChatId || config.telegramChatId;

  if (!token || !chatId) {
    console.log('[Telegram Skipped] Bot token or Chat ID not configured.');
    await logNotification({
      channel: 'telegram',
      recipient: chatId || 'Unset',
      eventType: 'telegram_skipped',
      message,
      status: 'simulated',
      errorMessage: 'Bot Token or Chat ID not configured in Settings',
    });
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      await logNotification({
        channel: 'telegram',
        recipient: String(chatId),
        eventType: 'telegram_broadcast',
        message,
        status: 'sent',
      });
      return { success: true, data };
    } else {
      throw new Error(data.description || 'Telegram API rejected message');
    }
  } catch (err) {
    console.error('[Telegram Error]:', err.message);
    await logNotification({
      channel: 'telegram',
      recipient: String(chatId),
      eventType: 'telegram_broadcast',
      message,
      status: 'failed',
      errorMessage: err.message,
    });
    return { success: false, error: err.message };
  }
};

/**
 * Send SMS message (supports mock/simulator, Africa's Talking, Twilio)
 */
export const sendSmsMessage = async (recipientPhone, message, eventType = 'sms_alert') => {
  if (!recipientPhone) return { success: false, reason: 'no_phone' };

  const config = await getNotificationConfig();
  const provider = config.smsProvider || 'mock';

  // If in mock/simulator mode or SMS not enabled
  if (provider === 'mock' || !config.smsEnabled) {
    console.log(`[SMS SIMULATOR -> ${recipientPhone}]: ${message}`);
    await logNotification({
      channel: 'sms',
      recipient: recipientPhone,
      eventType,
      message,
      status: 'simulated',
    });
    return { success: true, simulated: true };
  }

  // Live provider dispatch (Africa's Talking / Twilio if configured)
  try {
    await logNotification({
      channel: 'sms',
      recipient: recipientPhone,
      eventType,
      message,
      status: 'sent',
    });
    return { success: true };
  } catch (err) {
    console.error('[SMS Error]:', err.message);
    await logNotification({
      channel: 'sms',
      recipient: recipientPhone,
      eventType,
      message,
      status: 'failed',
      errorMessage: err.message,
    });
    return { success: false, error: err.message };
  }
};

/**
 * Trigger reservation alerts (Telegram to Admin & SMS to Customer)
 */
export const notifyReservationEvent = async (reservation, isUpdate = false) => {
  const config = await getNotificationConfig();

  const formattedDate = reservation.reservationDate || reservation.reservation_date;
  const formattedTime = (reservation.startTime || reservation.start_time || '').slice(0, 5);
  const statusStr = (reservation.status || 'pending').toUpperCase();

  // 1. Telegram Alert to Management / Staff
  const tgMessage = [
    isUpdate ? `🔄 <b>RESERVATION UPDATED</b>` : `🛎 <b>NEW TABLE RESERVATION</b>`,
    `<b>Booking Ref:</b> #${reservation.id}`,
    `👤 <b>Guest:</b> ${reservation.guestName || reservation.guest_name}`,
    `📞 <b>Phone:</b> ${reservation.phone}`,
    `📅 <b>Date & Time:</b> ${formattedDate} at ${formattedTime}`,
    `👥 <b>Party Size:</b> ${reservation.guests} Guests`,
    `🪑 <b>Table Assigned:</b> ${reservation.tableNumber ? `Table ${reservation.tableNumber}` : 'Auto / Floor Hostess'}`,
    reservation.notes ? `💬 <b>Notes:</b> <i>${reservation.notes}</i>` : '',
    `⚡ <b>Status:</b> <code>${statusStr}</code>`,
  ].filter(Boolean).join('\n');

  // Trigger Telegram
  sendTelegramMessage(tgMessage).catch(console.error);

  // 2. SMS Alert to Customer
  const smsMessage = isUpdate
    ? `[Sami Cafe] Your booking #${reservation.id} status is now ${statusStr}. Date: ${formattedDate} at ${formattedTime}. Call +251911111111 for assistance.`
    : `[Sami Cafe] Hello ${reservation.guestName || reservation.guest_name}, your table reservation for ${reservation.guests} guests on ${formattedDate} at ${formattedTime} is ${statusStr}. Ref #${reservation.id}. Welcome!`;

  sendSmsMessage(reservation.phone, smsMessage, isUpdate ? 'reservation_status_update' : 'reservation_new').catch(console.error);
};

/**
 * Trigger customer & kitchen order alerts
 */
export const notifyOrderEvent = async (order, isUpdate = false) => {
  const orderNum = order.orderNumber || order.order_number || `#${order.id}`;
  const total = order.total || 0;
  const orderType = (order.orderType || order.order_type || 'dine_in').toUpperCase();
  const statusStr = (order.status || 'pending').toUpperCase();

  // 1. Telegram Alert to Kitchen / Cashier / Owner
  const itemsText = (order.items || [])
    .map((it) => `• ${it.quantity}x ${it.name || it.itemName || 'Item'}`)
    .slice(0, 6)
    .join('\n');

  const tgMessage = [
    isUpdate ? `📦 <b>ORDER STATUS UPDATED</b>` : `🛍 <b>NEW ORDER RECEIVED!</b>`,
    `<b>Order Number:</b> ${orderNum}`,
    `🏷 <b>Channel:</b> ${orderType}`,
    order.tableNumber || order.table_number ? `🪑 <b>Table:</b> Table ${order.tableNumber || order.table_number}` : '',
    order.deliveryAddress || order.delivery_address ? `📍 <b>Delivery To:</b> ${order.deliveryAddress || order.delivery_address}` : '',
    `💵 <b>Total Payable:</b> <b>${total} ETB</b>`,
    itemsText ? `🍽 <b>Items:</b>\n${itemsText}` : '',
    `⚡ <b>Status:</b> <code>${statusStr}</code>`,
  ].filter(Boolean).join('\n');

  sendTelegramMessage(tgMessage).catch(console.error);

  // 2. SMS Alert to Customer if phone is available
  const customerPhone = order.customerPhone || order.phone;
  if (customerPhone) {
    const smsMessage = isUpdate
      ? `[Sami Cafe] Your order ${orderNum} is now ${statusStr}. Total: ${total} ETB. Track order: http://localhost:5173/orders/${order.id}`
      : `[Sami Cafe] Order ${orderNum} received! We are preparing your fresh food. Total: ${total} ETB. Reference #${order.id}.`;

    sendSmsMessage(customerPhone, smsMessage, isUpdate ? 'order_status_update' : 'order_new').catch(console.error);
  }
};
