import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Clock, AlertCircle, Sparkles, Receipt, ArrowRight, Utensils } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { ORDER_STATUSES } from '../../utils/constants';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders()
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Retrieving your dining records..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Dining History
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-coffee-950 mt-1">
            My Orders & Receipts
          </h1>
        </div>

        <Link to="/menu">
          <Button variant="primary" size="md" className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20">
            <Utensils className="w-4 h-4" /> Order New Dish
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 rounded-full bg-coffee-100 text-coffee-800 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-display font-black text-2xl text-coffee-950">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Experience our famous wood-fired Derek Tibs, Royal Doro Wat, or cold layered Spris juice today.
          </p>
          <Link to="/menu" className="inline-block pt-2">
            <Button variant="primary" size="md" className="font-bold bg-amber-500 hover:bg-amber-600 text-stone-950">
              Browse Menu &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || {
              label: order.status,
              color: 'bg-stone-100 text-stone-800 border-stone-200',
            };

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-base text-coffee-950">
                      #{order.orderNumber || order.id}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-[11px] font-bold uppercase text-stone-400">
                      {order.orderType ? order.orderType.replace(/_/g, ' ') : 'Dine In'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{formatDateTime(order.createdAt)}</span>
                    {order.tableNumber && (
                      <span className="font-bold text-coffee-800">• Table: {order.tableNumber}</span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {order.items?.map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] font-medium text-stone-700"
                      >
                        <strong>{it.quantity}×</strong> {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block">
                      Total Paid
                    </span>
                    <span className="font-display font-black text-xl text-leaf-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <Link to={`/orders/${order.id}`}>
                    <button className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-coffee-950 hover:text-white text-coffee-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs group-hover:bg-coffee-900 group-hover:text-white">
                      <Receipt className="w-3.5 h-3.5" />
                      Track & Receipt
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
