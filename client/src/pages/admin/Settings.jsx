import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Store,
  Percent,
  Truck,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Sparkles,
  Send,
  MessageSquare,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Radio,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification testing states
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [smsTesting, setSmsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('+251911111111');
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchSettingsAndLogs = async () => {
    try {
      const [settingsRes, logsRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getNotificationLogs().catch(() => ({ data: [] })),
      ]);
      setSettings(settingsRes.data || {});
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success('🎉 System parameters & notification settings updated!');
      fetchNotificationLogs();
    } catch (err) {
      toast.error(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const fetchNotificationLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await adminApi.getNotificationLogs();
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!settings.telegram_bot_token?.trim() || !settings.telegram_chat_id?.trim()) {
      toast.error('⚠️ Telegram Bot Token & Chat ID are empty! To test phone alerts, click "Dispatch Test SMS" in the green section below.', { duration: 6000 });
      return;
    }
    setTelegramTesting(true);
    try {
      // First save current values if not yet saved
      await adminApi.updateSettings(settings);
      const res = await adminApi.sendTestTelegram({
        chatId: settings.telegram_chat_id,
      });
      toast.success(res.message || 'Telegram test message sent successfully!');
      fetchNotificationLogs();
    } catch (err) {
      toast.error(err.message || 'Telegram test failed. Check Bot Token & Chat ID.');
    } finally {
      setTelegramTesting(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone?.trim()) {
      toast.error('⚠️ Please enter a recipient phone number (e.g. +251911111111).');
      return;
    }
    setSmsTesting(true);
    try {
      await adminApi.updateSettings(settings);
      const res = await adminApi.sendTestSms({
        phone: testPhone,
      });
      toast.success(res.message || '🎉 Test SMS dispatched successfully!');
      fetchNotificationLogs();
    } catch (err) {
      toast.error(err.message || 'SMS test dispatch failed.');
    } finally {
      setSmsTesting(false);
    }
  };

  if (loading) return <Loader text="Loading restaurant system parameters..." />;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Platform Configuration
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Operating & Notification Hub
          </h1>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          loading={saving}
          onClick={handleSave}
          className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
        >
          <Save className="w-4 h-4" /> Save Operating Settings
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Telegram Bot & Channel Real-time Alerts */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-coffee-950">
                  Telegram Bot Real-Time Alerts
                </h3>
                <p className="text-xs text-stone-400">
                  Instant table bookings & customer orders pushed to your phone or staff channel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-600">Telegram Status:</span>
              <button
                type="button"
                onClick={() =>
                  handleChange('telegram_enabled', settings.telegram_enabled === 'true' ? 'false' : 'true')
                }
                className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                  settings.telegram_enabled === 'true'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {settings.telegram_enabled === 'true' ? 'ACTIVE / ON' : 'DISABLED / OFF'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Telegram Bot API Token"
                type="password"
                value={settings.telegram_bot_token || ''}
                onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                placeholder="e.g. 7123456789:AAHq_..."
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Generated via <strong>@BotFather</strong> on Telegram.
              </p>
            </div>

            <div>
              <Input
                label="Management Chat ID / Channel ID"
                value={settings.telegram_chat_id || ''}
                onChange={(e) => handleChange('telegram_chat_id', e.target.value)}
                placeholder="e.g. 987654321 or -100123456789"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Your Telegram user ID or group chat ID where alerts will be delivered.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-600">
              <span className="font-bold">Test Delivery:</span> Dispatches an instant test message to verify your Telegram Bot connection.
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={telegramTesting}
              onClick={handleTestTelegram}
              className="gap-2 font-bold border-sky-400 text-sky-700 hover:bg-sky-50 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" /> Send Test Telegram Alert
            </Button>
          </div>
        </div>

        {/* Customer & Staff SMS Gateway */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-coffee-950">
                  Customer SMS Alerts Gateway
                </h3>
                <p className="text-xs text-stone-400">
                  Sends automated SMS confirmations to diners when their table or food is ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-600">SMS Gateway:</span>
              <button
                type="button"
                onClick={() =>
                  handleChange('sms_enabled', settings.sms_enabled === 'true' ? 'false' : 'true')
                }
                className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                  settings.sms_enabled === 'true'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {settings.sms_enabled === 'true' ? 'ACTIVE / ON' : 'DISABLED / OFF'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                SMS Provider / Carrier
              </label>
              <select
                value={settings.sms_provider || 'mock'}
                onChange={(e) => handleChange('sms_provider', e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-coffee-950 focus:outline-none"
              >
                <option value="mock">Simulator (Zero Cost • Logs to DB & Console)</option>
                <option value="africastalking">Africa's Talking (Ethiopia & East Africa)</option>
                <option value="twilio">Twilio SMS Gateway</option>
                <option value="ethiosms">Ethio Telecom Bulk SMS API</option>
              </select>
            </div>

            <Input
              label="SMS Sender ID / Mask"
              value={settings.sms_sender_id || 'SamiCafe'}
              onChange={(e) => handleChange('sms_sender_id', e.target.value)}
              placeholder="e.g. SamiCafe"
            />

            <Input
              label="SMS Provider API Key"
              type="password"
              value={settings.sms_api_key || ''}
              onChange={(e) => handleChange('sms_api_key', e.target.value)}
              placeholder="(Optional for Simulator)"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-600 whitespace-nowrap">Test Recipient Phone:</span>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-44 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                placeholder="+251911111111"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={smsTesting}
              onClick={handleTestSms}
              className="gap-2 font-bold border-emerald-400 text-emerald-800 hover:bg-emerald-50 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Test SMS
            </Button>
          </div>
        </div>

        {/* Business Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-coffee-100 text-coffee-800 flex items-center justify-center font-bold">
              <Store className="w-5 h-5 text-coffee-800" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-coffee-950">
                Business & Brand Identity
              </h3>
              <p className="text-xs text-stone-400">Official name, tagline, and contact information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Restaurant Brand Name"
              value={settings.restaurant_name || ''}
              onChange={(e) => handleChange('restaurant_name', e.target.value)}
            />
            <Input
              label="Tagline / Motto"
              value={settings.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
            />
            <Input
              label="Primary Phone Number"
              value={settings.restaurant_phone || ''}
              onChange={(e) => handleChange('restaurant_phone', e.target.value)}
            />
            <Input
              label="Official Contact Email"
              value={settings.restaurant_email || ''}
              onChange={(e) => handleChange('restaurant_email', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Physical Street Address (Addis Ababa)
            </label>
            <input
              type="text"
              value={settings.restaurant_address || ''}
              onChange={(e) => handleChange('restaurant_address', e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-xs text-stone-800 focus:outline-none focus:border-coffee-700"
            />
          </div>
        </div>

        {/* Taxes & Rates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5 text-leaf-700" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-coffee-950">
                Financial Rates & Delivery Logistics
              </h3>
              <p className="text-xs text-stone-400">Ethiopian tax regulations and logistics costs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Value Added Tax Rate (Decimal: 0.15 = 15% VAT)"
              type="number"
              step="0.01"
              value={settings.tax_rate || '0.15'}
              onChange={(e) => handleChange('tax_rate', e.target.value)}
            />
            <Input
              label="Standard City Delivery Fee (ETB)"
              type="number"
              step="0.01"
              value={settings.delivery_fee || '120.00'}
              onChange={(e) => handleChange('delivery_fee', e.target.value)}
            />
            <Input
              label="Official Operating Hours"
              value={settings.opening_hours || ''}
              onChange={(e) => handleChange('opening_hours', e.target.value)}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Online Table Booking Policy
              </label>
              <select
                value={settings.auto_confirm_reservations || 'true'}
                onChange={(e) => handleChange('auto_confirm_reservations', e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-coffee-950 focus:outline-none"
              >
                <option value="true">Instant Auto-Confirmation (Recommended)</option>
                <option value="false">Manual Review by Hostess / Manager</option>
              </select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={saving}
          className="py-3.5 px-8 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 gap-2"
        >
          <Save className="w-4 h-4" /> Save Operating & Alert Settings
        </Button>
      </form>

      {/* Live Notifications Delivery Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-coffee-950">
                Recent Dispatched Alerts Log ({logs.length})
              </h3>
              <p className="text-xs text-stone-400">
                Audit trail of outgoing SMS messages and Telegram alert dispatches
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={loadingLogs}
            onClick={fetchNotificationLogs}
            className="gap-2 text-xs font-bold border border-stone-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
          </Button>
        </div>

        {logs.length === 0 ? (
          <div className="py-10 text-center text-stone-400 text-xs">
            No outgoing notifications recorded yet. Submit a test message or new reservation to see alerts stream here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-[10px] uppercase font-black tracking-wider text-stone-500 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Channel</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Message Preview</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          log.channel === 'telegram'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-800 truncate max-w-[120px]">
                      {log.recipient}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-600 truncate max-w-[140px]">
                      {log.eventType?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-stone-700 truncate max-w-[260px]" title={log.message}>
                      {log.message}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          log.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                            : log.status === 'simulated'
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
