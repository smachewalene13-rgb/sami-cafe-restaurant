import { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertTriangle, Coffee, Sparkles, Flame, Volume2, RefreshCw, Filter, Utensils } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pending' | 'preparing'
  const [completedItems, setCompletedItems] = useState({}); // orderId-itemId: boolean
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchKitchenOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
      const active = (res.data || []).filter((o) =>
        ['pending', 'confirmed', 'preparing'].includes(o.status)
      );
      setOrders(active);
    } catch (err) {
      console.error('KDS load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const pollInterval = setInterval(fetchKitchenOrders, 15000);
    const clockInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Real-time listener for incoming orders
  useSocket('order:new', (newOrder) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-stone-900 border-2 border-amber-500 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 text-white`}>
        <div className="flex-1 w-0 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-amber-400">🔥 NEW TICKET RECEIVED!</p>
            <p className="text-xs text-stone-300">Order #{newOrder.order_number || newOrder.id} • {newOrder.order_type || 'Dine-In'}</p>
          </div>
        </div>
      </div>
    ), { duration: 6000 });
    fetchKitchenOrders();
  });

  useSocket('order:status', () => {
    fetchKitchenOrders();
  });

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, nextStatus);
      toast.success(
        nextStatus === 'ready'
          ? `🎉 Ticket #${orderId} ready for dispatch!`
          : `🔥 Ticket #${orderId} moved to stove/oven!`
      );
      fetchKitchenOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const toggleItemDone = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getElapsedMinutes = (dateString) => {
    if (!dateString) return 0;
    const diff = Math.floor((currentTime - new Date(dateString).getTime()) / 60000);
    return Math.max(0, diff);
  };

  const getTimerBadge = (minutes) => {
    if (minutes >= 15) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          {minutes}m (RUSH LATE)
        </span>
      );
    }
    if (minutes >= 10) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          {minutes}m (Attention)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        {minutes}m (On Time)
      </span>
    );
  };

  if (loading) return <Loader text="Connecting to High-Speed Kitchen Display System..." />;

  const filteredOrders = orders.filter((o) => {
    if (filterType === 'pending') return ['pending', 'confirmed'].includes(o.status);
    if (filterType === 'preparing') return o.status === 'preparing';
    return true;
  });

  const pendingCount = orders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-stone-950 text-stone-100 space-y-6">
      {/* Top Professional KDS Bar */}
      <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
                Sami Kitchen Display (KDS)
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Live Cooking Station • Expedite tickets with real-time dish checklist
            </p>
          </div>
        </div>

        {/* Filter Tabs & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-stone-800/90 p-1 rounded-2xl border border-stone-700/60 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                filterType === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All Tickets ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filterType === 'pending'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              New ({pendingCount})
            </button>
            <button
              onClick={() => setFilterType('preparing')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filterType === 'preparing'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Cooking ({preparingCount})
            </button>
          </div>

          <button
            onClick={fetchKitchenOrders}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition"
            title="Refresh tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-stone-900/60 border border-dashed border-stone-800 rounded-3xl p-16 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
            <Utensils className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="font-display font-bold text-xl text-stone-300">Kitchen Queue Is Clear!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            All current orders have been prepared and dispatched. Incoming dining and delivery tickets will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isCooking = order.status === 'preparing';
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed >= 15;

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-xl ${
                  isLate
                    ? 'border-rose-500/80 bg-gradient-to-b from-stone-900 via-stone-900 to-rose-950/30'
                    : isCooking
                    ? 'border-purple-500/60 bg-gradient-to-b from-stone-900 via-stone-900 to-purple-950/20'
                    : 'border-amber-500/50 bg-stone-900'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-4 sm:p-5 border-b border-stone-800/80 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                          {order.orderType ? order.orderType.replace(/_/g, ' ') : 'Dine In'}
                        </span>
                        {order.tableNumber && (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-500 text-stone-950 shadow-sm">
                            TABLE {order.tableNumber}
                          </span>
                        )}
                      </div>
                      <h2 className="font-display font-black text-2xl text-white tracking-tight mt-1">
                        #{order.orderNumber || order.id}
                      </h2>
                    </div>

                    <div className="text-right space-y-1">
                      {getTimerBadge(elapsed)}
                      <p className="text-[10px] font-mono text-stone-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>

                  {/* Customer / Waiter notes */}
                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-start gap-1.5">
                      <span className="font-bold text-amber-400">NOTE:</span>
                      <span>"{order.notes}"</span>
                    </div>
                  )}
                </div>

                {/* Checklist items */}
                <div className="p-4 sm:p-5 space-y-2 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center justify-between">
                    <span>Order Items (Tap to check off)</span>
                    <span>{order.items?.length || 0} dishes</span>
                  </p>

                  <div className="space-y-2">
                    {order.items?.map((item, idx) => {
                      const isDone = !!completedItems[`${order.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemDone(order.id, idx)}
                          className={`p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-start justify-between gap-3 ${
                            isDone
                              ? 'bg-stone-900/40 border-stone-800 opacity-40 line-through text-stone-500'
                              : 'bg-stone-800/60 border-stone-700/60 hover:bg-stone-800 text-stone-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                isDone
                                  ? 'bg-stone-800 text-stone-500'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {item.quantity}×
                            </span>
                            <div>
                              <p className={`font-bold text-sm ${isDone ? 'line-through' : 'text-stone-100'}`}>
                                {item.name}
                              </p>
                              {item.specialNote && (
                                <p className="text-xs font-semibold text-rose-400 mt-0.5">
                                  ⚠️ Special: "{item.specialNote}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-500 text-stone-950'
                                : 'border-stone-600 bg-stone-900'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 sm:p-5 bg-stone-900/90 border-t border-stone-800/80">
                  {!isCooking ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-98"
                    >
                      <Flame className="w-4 h-4 fill-stone-950" />
                      START COOKING
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      ORDER READY FOR EXPEDITE &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
