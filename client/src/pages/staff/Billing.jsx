import { useState, useEffect } from 'react';
import { Receipt, CheckCircle, Printer, Banknote, CreditCard, Smartphone, RefreshCw, Scissors, Calculator, Search, Coffee } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function Billing() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [splitCount, setSplitCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchBillableOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
      const billable = (res.data || []).filter((o) =>
        ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(billable);
      if (billable.length > 0 && !selectedOrder) {
        setSelectedOrder(billable[0]);
      }
    } catch (err) {
      console.error('Failed to load orders for billing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillableOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setTenderedAmount(String(selectedOrder.total || ''));
    }
  }, [selectedOrder]);

  const handleCloseBill = async () => {
    if (!selectedOrder) return;

    setProcessing(true);
    try {
      await orderApi.recordCashPayment({
        orderId: selectedOrder.id,
        amount: selectedOrder.total,
        method: paymentMethod,
      });

      await orderApi.updateOrderStatus(selectedOrder.id, 'completed');

      toast.success(`🎉 Bill settled for Order #${selectedOrder.orderNumber || selectedOrder.id}! Table released.`);
      setSelectedOrder(null);
      fetchBillableOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to complete bill settlement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader text="Loading Sami Cafe Cashier POS Terminal..." />;

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const orderNum = String(o.orderNumber || o.id).toLowerCase();
    const tableNum = String(o.tableNumber || '').toLowerCase();
    return orderNum.includes(q) || tableNum.includes(q);
  });

  const splitAmount = selectedOrder ? Number((selectedOrder.total / splitCount).toFixed(2)) : 0;
  const numericTendered = parseFloat(tenderedAmount) || 0;
  const changeDue = selectedOrder ? Math.max(0, numericTendered - selectedOrder.total) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Point of Sale • Cashier Desk
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Billing & Settlement Terminal
          </h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchBillableOrders}
          className="gap-2 text-xs font-bold bg-white border border-stone-200 hover:bg-stone-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Open Tabs ({orders.length})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Open Tabs / In-Progress Tickets */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table or order #..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs font-medium focus:outline-none focus:border-coffee-700"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300">
              <Receipt className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-400">No open bills matching search.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredOrders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-coffee-900 bg-coffee-950 text-white shadow-lg'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm ${isSelected ? 'text-gold-300' : 'text-coffee-950'}`}>
                          #{o.orderNumber || o.id}
                        </span>
                        {o.tableNumber && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isSelected ? 'bg-gold-500 text-stone-950' : 'bg-coffee-100 text-coffee-800'
                            }`}
                          >
                            Table {o.tableNumber}
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-display font-black text-sm ${
                          isSelected ? 'text-gold-400' : 'text-leaf-600'
                        }`}
                      >
                        {formatCurrency(o.total)}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between text-xs ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      <span className="capitalize">{o.orderType ? o.orderType.replace(/_/g, ' ') : 'Dine In'}</span>
                      <span
                        className={`uppercase text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Thermal Receipt Settlement Terminal */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          {selectedOrder ? (
            <>
              {/* Thermal Paper Receipt Design */}
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 relative overflow-hidden shadow-inner">
                {/* Perforated top illusion */}
                <div className="flex justify-center -mt-6 mb-4">
                  <div className="w-32 h-1 bg-stone-300 rounded-full" />
                </div>

                <div className="text-center pb-4 border-b border-dashed border-stone-300 space-y-1">
                  <div className="w-10 h-10 rounded-full bg-coffee-900 text-gold-400 flex items-center justify-center mx-auto mb-1">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-black text-xl text-coffee-950 tracking-tight">
                    SAMI CAFE & RESTAURANT
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Bole Medhanialem, Addis Ababa • TIN: 0098472911
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-stone-600">
                    <span>Invoice: #{selectedOrder.orderNumber || selectedOrder.id}</span>
                    <span>{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-200/80 text-xs py-2">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-coffee-900">{it.quantity}×</span>
                        <span className="text-stone-800 font-medium">{it.name}</span>
                      </div>
                      <span className="font-bold font-mono text-stone-900">
                        {formatCurrency(it.unitPrice * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-3 border-t border-dashed border-stone-300 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-leaf-600 font-bold">
                      <span>Discount</span>
                      <span className="font-mono">-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT (15%)</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-coffee-950 pt-2 border-t border-stone-300">
                    <span>TOTAL PAYABLE</span>
                    <span className="text-leaf-600 font-display text-xl font-black">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Split Bill Calculator & Cash Change */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Split Bill */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-gold-600" /> Split Check
                    </span>
                    <select
                      value={splitCount}
                      onChange={(e) => setSplitCount(parseInt(e.target.value, 10))}
                      className="rounded-xl border border-stone-300 bg-white px-2.5 py-1 text-xs font-bold text-stone-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} Person{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {splitCount > 1 && (
                    <div className="pt-1.5 border-t border-stone-200 flex justify-between items-center text-xs">
                      <span className="text-stone-500">Per Person:</span>
                      <span className="font-black text-leaf-600 font-mono text-sm">
                        {formatCurrency(splitAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cash Tender Calculator */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-coffee-600" /> Cash Tendered
                    </span>
                    <input
                      type="number"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      className="w-24 px-2 py-1 text-right text-xs font-bold rounded-lg border border-stone-300 bg-white focus:outline-none"
                    />
                  </div>
                  <div className="pt-1.5 border-t border-stone-200 flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-medium">Change to Return:</span>
                    <span className="font-black font-mono text-sm text-gold-700">
                      {formatCurrency(changeDue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Select Settlement Channel
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'cash', label: 'Cash / Birr', icon: Banknote },
                    { id: 'mobile_money', label: 'Telebirr QR', icon: Smartphone },
                    { id: 'card', label: 'Bank Card POS', icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-xs font-bold gap-1.5 transition ${
                          paymentMethod === m.id
                            ? 'border-coffee-900 bg-coffee-950 text-white shadow-md'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => window.print()}
                  className="w-full sm:w-1/3 py-3 rounded-2xl font-bold gap-2 text-stone-800"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={processing}
                  onClick={handleCloseBill}
                  className="w-full sm:w-2/3 py-3 rounded-2xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle className="w-4 h-4" /> Settle Bill & Release Table
                </Button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-stone-400">
              <Receipt className="w-12 h-12 mx-auto mb-2 opacity-40 text-stone-300" />
              <p className="text-sm font-medium">Select an open order on the left to settle the bill.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
