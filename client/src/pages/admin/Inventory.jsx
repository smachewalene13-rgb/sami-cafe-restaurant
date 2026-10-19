import { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Plus, RefreshCw, CheckCircle2, Search, ArrowDownCircle, Truck, PackageCheck } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [ingredients, setIngredients] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockReason, setRestockReason] = useState('Supplier Delivery');

  const loadInventory = async () => {
    try {
      const [allRes, lowRes] = await Promise.all([
        adminApi.getIngredients(),
        adminApi.getLowStock(),
      ]);
      setIngredients(allRes.data || []);
      setLowStock(lowRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenRestock = (ing) => {
    setSelectedIngredient(ing);
    setRestockQty('');
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockQty || parseFloat(restockQty) <= 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }

    try {
      await adminApi.stockIn({
        ingredientId: selectedIngredient.id,
        quantity: parseFloat(restockQty),
        reason: restockReason,
      });
      toast.success(`Successfully restocked ${restockQty} ${selectedIngredient.unit} of ${selectedIngredient.name}`);
      setIsRestockOpen(false);
      loadInventory();
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    }
  };

  if (loading) return <Loader text="Connecting to Kitchen Pantry & Inventory..." />;

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase()) ||
    (ing.supplierName && ing.supplierName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Pantry & Kitchen Supply
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Ingredients & Inventory Stock
          </h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadInventory}
          className="gap-2 text-xs font-bold bg-white border border-stone-200"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Stock Levels
        </Button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStock.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                Low Stock Threshold Alerts ({lowStock.length} items below safety limit)
              </h3>
              <p className="text-xs text-amber-800">
                Ingredients with stock at or below reorder level. Click any item to log restock intake.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {lowStock.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpenRestock(item)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <span>{item.name}:</span>
                <span className="text-rose-600">{item.stockQty} {item.unit}</span>
                <span className="text-[10px] text-stone-400 font-normal">(Min: {item.reorderLevel})</span>
                <span className="ml-1 text-gold-700">&rarr; Restock</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients, coffee beans, spices, meat cuts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-medium focus:outline-none focus:border-coffee-700"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Ingredient</th>
                <th className="py-4 px-5">Stock Level</th>
                <th className="py-4 px-5">Safety Threshold</th>
                <th className="py-4 px-5">Supplier</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((ing) => {
                const isUnder = ing.stockQty <= ing.reorderLevel;

                return (
                  <tr key={ing.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-coffee-100 text-coffee-800 flex items-center justify-center font-bold">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-coffee-950 text-sm">{ing.name}</p>
                          <p className="text-[10px] text-stone-400">Pantry item #{ing.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`font-mono font-bold text-sm ${isUnder ? 'text-rose-600' : 'text-stone-900'}`}>
                        {ing.stockQty}{' '}
                      </span>
                      <span className="text-stone-500 font-medium">{ing.unit}</span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-600 font-mono">
                      {ing.reorderLevel} {ing.unit}
                    </td>
                    <td className="py-3.5 px-5 text-stone-600">
                      <p className="font-bold text-stone-800">{ing.supplierName || 'Mercato Local Wholesaler'}</p>
                      <p className="text-[10px] text-stone-400">{ing.supplierPhone || '+251 911 000 000'}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isUnder
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isUnder ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenRestock(ing)}
                        className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs transition"
                      >
                        Restock +
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockOpen && selectedIngredient && (
        <Modal
          isOpen={isRestockOpen}
          onClose={() => setIsRestockOpen(false)}
          title={`Restock ${selectedIngredient.name}`}
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <p><strong>Current Stock:</strong> {selectedIngredient.stockQty} {selectedIngredient.unit}</p>
              <p><strong>Reorder Alert Level:</strong> {selectedIngredient.reorderLevel} {selectedIngredient.unit}</p>
              <p><strong>Supplier:</strong> {selectedIngredient.supplierName || 'Default Supplier'}</p>
            </div>

            <Input
              label={`Quantity to Add (${selectedIngredient.unit})`}
              type="number"
              step="0.01"
              required
              autoFocus
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder={`e.g. 10 (${selectedIngredient.unit})`}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Restock Reason / Source
              </label>
              <select
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-coffee-950 focus:outline-none focus:border-coffee-700"
              >
                <option value="Supplier Delivery">Supplier Delivery</option>
                <option value="Direct Market Purchase">Direct Market Purchase (Mercato)</option>
                <option value="Inventory Count Adjustment">Inventory Count Adjustment</option>
                <option value="Emergency Restock">Emergency Restock</option>
              </select>
            </div>

            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsRestockOpen(false)}
                className="w-1/3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Confirm Restock
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
