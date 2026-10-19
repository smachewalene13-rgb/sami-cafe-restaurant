import { useState, useEffect } from 'react';
import { Eye, Clock, Search, Filter, RefreshCw, ShoppingBag, CheckCircle2, User } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { ORDER_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const res = await orderApi.getAllOrders({
        status: statusFilter || undefined,
        orderType: typeFilter || undefined,
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, typeFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Status updated to ${newStatus.toUpperCase()}`);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (loading) return <Loader text="Connecting to Restaurant Orders Ledger..." />;

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const num = String(o.orderNumber || o.id).toLowerCase();
    const cust = String(o.customerName || '').toLowerCase();
    const phone = String(o.customerPhone || '').toLowerCase();
    return num.includes(q) || cust.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Operations & Fulfilment
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Customer Orders Ledger
          </h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadOrders}
          className="gap-2 text-xs font-bold bg-white border border-stone-200"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer name, phone number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-medium focus:outline-none focus:border-coffee-700"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between pt-1">
          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-coffee-950 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {Object.keys(ORDER_STATUSES).map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUSES[st].label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-coffee-950 focus:outline-none"
            >
              <option value="">All Channels</option>
              <option value="dine_in">Dine-In</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          <span className="text-xs text-stone-500 font-bold">
            Showing {filteredOrders.length} of {orders.length} tickets
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Order #</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Type / Table</th>
                <th className="py-4 px-5">Total</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((o) => {
                const config = ORDER_STATUSES[o.status] || { label: o.status, color: 'bg-stone-100 text-stone-800' };

                return (
                  <tr key={o.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-coffee-950 text-sm">
                      #{o.orderNumber || o.id}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-stone-900">{o.customerName || 'Walk-In Guest'}</p>
                      <p className="text-[11px] text-stone-400">{o.customerPhone || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="capitalize font-bold text-stone-800">
                        {o.orderType ? o.orderType.replace(/_/g, ' ') : 'Dine In'}
                      </span>
                      {o.tableNumber && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-coffee-100 text-coffee-800">
                          Table {o.tableNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-display font-black text-leaf-600 text-sm">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                        {config.label || o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-500 font-medium">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-coffee-950 font-bold transition flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber || selectedOrder.id} Overview`}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px]">Customer</span>
                <p className="font-bold text-stone-900">{selectedOrder.customerName || 'Walk-In Guest'}</p>
                <p className="text-stone-500">{selectedOrder.customerPhone || 'No phone'}</p>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px]">Type / Location</span>
                <p className="font-bold text-stone-900 capitalize">{selectedOrder.orderType?.replace(/_/g, ' ')}</p>
                {selectedOrder.tableNumber && <p className="text-amber-700 font-bold">Table: {selectedOrder.tableNumber}</p>}
                {selectedOrder.deliveryAddress && <p className="text-stone-500">{selectedOrder.deliveryAddress}</p>}
              </div>
            </div>

            {/* Dish items */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Ordered Dishes
              </span>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3 text-xs">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-coffee-950">{it.quantity}×</span>{' '}
                      <span className="font-medium text-stone-800">{it.name}</span>
                      {it.specialNote && (
                        <p className="text-[11px] text-amber-700 font-medium">⚠️ Note: "{it.specialNote}"</p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-stone-800">
                      {formatCurrency(it.unitPrice * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status change actions */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Advance Order Status
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['pending', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase border transition ${
                      selectedOrder.status === st
                        ? 'bg-coffee-950 text-white border-coffee-950'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
