import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Minus, Send, Trash2, Search, Coffee, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { menuApi } from '../../api/menu.api';
import { reservationApi } from '../../api/reservation.api';
import { orderApi } from '../../api/order.api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function WaiterOrders() {
  const [searchParams] = useSearchParams();
  const initialTableId = searchParams.get('tableId') || '';

  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(initialTableId);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOrderItems, setCurrentOrderItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([reservationApi.getTables(), menuApi.getMenuItems({ limit: 100 })])
      .then(([tablesRes, menuRes]) => {
        setTables(tablesRes.data || []);
        setMenuItems(menuRes.data?.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = (item) => {
    const existingIndex = currentOrderItems.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      const updated = [...currentOrderItems];
      updated[existingIndex].quantity += 1;
      setCurrentOrderItems(updated);
    } else {
      setCurrentOrderItems([...currentOrderItems, { ...item, quantity: 1, note: '' }]);
    }
    toast.success(`Added ${item.name}`, { duration: 1200, position: 'bottom-center' });
  };

  const handleUpdateQty = (index, delta) => {
    const updated = [...currentOrderItems];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCurrentOrderItems(updated);
  };

  const handleItemNoteChange = (index, note) => {
    const updated = [...currentOrderItems];
    updated[index].note = note;
    setCurrentOrderItems(updated);
  };

  const handleClearTicket = () => {
    if (currentOrderItems.length === 0) return;
    setCurrentOrderItems([]);
    toast('Ticket cleared');
  };

  const subtotal = currentOrderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = Number((subtotal * 0.15).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const handleSendToKitchen = async () => {
    if (!selectedTableId) {
      toast.error('Please assign a dining table for this order!');
      return;
    }
    if (currentOrderItems.length === 0) {
      toast.error('Please add at least one dish to the ticket!');
      return;
    }

    setSubmitting(true);
    try {
      const formattedItems = currentOrderItems.map((i) => ({
        menu_item_id: i.id,
        quantity: i.quantity,
        note: i.note || null,
      }));

      const res = await orderApi.createOrder({
        items: formattedItems,
        orderType: 'dine_in',
        tableId: parseInt(selectedTableId, 10),
        notes: notes || undefined,
      });

      toast.success(`🎉 Order #${res.data.order_number || res.data.id} sent directly to Kitchen Display!`);
      setCurrentOrderItems([]);
      setNotes('');
      navigate('/staff/kitchen');
    } catch (err) {
      toast.error(err.message || 'Failed to submit waiter order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading Waiter Ordering POS..." />;

  const categories = ['all', ...new Set(menuItems.map((m) => m.categoryName).filter(Boolean))];

  const filteredMenu = menuItems.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.categoryName && m.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || m.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-white">
              Waiter Floor Ordering POS
            </h1>
            <p className="text-xs text-stone-400">
              Quick table ordering desk • Instant dispatch to Kitchen Display
            </p>
          </div>
        </div>

        {/* Table Selector */}
        <div className="flex items-center gap-2 bg-stone-800/80 p-1.5 rounded-2xl border border-stone-700">
          <label className="text-xs font-bold text-stone-300 pl-2">Table:</label>
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            className="rounded-xl border border-stone-600 bg-stone-900 px-3 py-1.5 text-xs font-bold text-amber-400 focus:outline-none"
          >
            <option value="">Choose Table...</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tableNumber} ({t.location || 'Main Floor'}) - {t.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Menu & Food Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, Tibs, Doro Wat, Coffee, Juice..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-xs font-medium focus:outline-none focus:border-coffee-700 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-coffee-950 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                  }`}
                >
                  {cat === 'all' ? 'All Dishes' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddItem(item)}
                className="group bg-white rounded-3xl p-3.5 border border-stone-200 hover:border-gold-500 cursor-pointer shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 mb-1">
                    <span className="uppercase text-gold-600 font-black">{item.categoryName}</span>
                    {item.isFasting && (
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
                        Tsom
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-sm text-coffee-950 line-clamp-1 group-hover:text-gold-600 transition">
                    {item.name}
                  </h4>
                </div>

                <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="font-display font-bold text-xs text-leaf-600">
                    {formatCurrency(item.price)}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform shadow-xs">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Ticket Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-display font-black text-lg text-coffee-950">
                Active Kitchen Ticket
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                {selectedTable ? `Table: ${selectedTable.tableNumber} (${selectedTable.location || 'Main Floor'})` : 'No table assigned'}
              </p>
            </div>
            {currentOrderItems.length > 0 && (
              <button
                onClick={handleClearTicket}
                className="text-stone-400 hover:text-rose-600 transition p-1"
                title="Clear Ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Ticket Items */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {currentOrderItems.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <UtensilsCrossed className="w-10 h-10 mx-auto text-stone-300 opacity-60" />
                <p className="text-xs">No items yet. Tap menu cards on the left to add items.</p>
              </div>
            ) : (
              currentOrderItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900">{item.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">{formatCurrency(item.price)} each</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
                      <button
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="w-6 h-6 rounded-lg hover:bg-stone-100 flex items-center justify-center font-bold text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black px-1.5 text-xs text-coffee-950">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="w-6 h-6 rounded-lg hover:bg-stone-100 flex items-center justify-center font-bold text-stone-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.note || ''}
                    onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                    placeholder="Kitchen note (e.g. well-done, extra awaze)..."
                    className="w-full text-[11px] rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 focus:outline-none focus:border-coffee-700"
                  />
                </div>
              ))
            )}
          </div>

          {/* General Table Note */}
          <div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Table instructions (e.g. VIP guest, anniversary)..."
              className="w-full text-xs rounded-2xl border border-stone-200 p-3 focus:outline-none focus:border-coffee-700"
            />
          </div>

          {/* Financial Calculation */}
          <div className="space-y-1.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-coffee-950 pt-2 border-t border-stone-200">
              <span>Estimated Total</span>
              <span className="text-leaf-600 font-display text-xl font-black">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={submitting}
            onClick={handleSendToKitchen}
            className="w-full py-3.5 rounded-2xl gap-2 font-black bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/20"
          >
            <Send className="w-4 h-4 fill-stone-950" /> Send Ticket to Kitchen
          </Button>
        </div>
      </div>
    </div>
  );
}
