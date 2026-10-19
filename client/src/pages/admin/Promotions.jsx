import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, CheckCircle2, Ticket, Percent, Sparkles } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    minOrder: '300.00',
    usageLimit: 100,
  });

  const loadPromos = async () => {
    try {
      const res = await adminApi.getPromos();
      setPromos(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createPromo(formData);
      toast.success('Promotional voucher created!');
      setIsModalOpen(false);
      loadPromos();
    } catch (err) {
      toast.error(err.message || 'Failed to create promo');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promotional voucher?')) return;
    try {
      await adminApi.deletePromo(id);
      toast.success('Promo voucher removed');
      loadPromos();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (loading) return <Loader text="Loading marketing discounts and vouchers..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Marketing & Growth Campaigns
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Discounts & Promotional Vouchers
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Create Promo Voucher
        </Button>
      </div>

      {/* Vouchers Grid */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
          <Ticket className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-400">No active promotional vouchers. Click above to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promos.map((promo) => {
            const isPercent = promo.discount_type === 'percentage';
            const usagePercent = promo.usage_limit
              ? Math.min(100, Math.round(((promo.used_count || 0) / promo.usage_limit) * 100))
              : 0;

            return (
              <div
                key={promo.id}
                className="bg-white rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow border-2 border-stone-200 relative overflow-hidden flex flex-col justify-between space-y-4"
              >
                {/* Perforated edge decor */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-mono font-black text-sm tracking-wider shadow-2xs">
                      {promo.code}
                    </span>
                    <span className="text-xs text-stone-400 font-bold uppercase">
                      {promo.discount_type}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      promo.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {promo.is_active ? 'Live' : 'Paused'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-3xl text-coffee-950">
                      {isPercent ? `${promo.value}%` : formatCurrency(promo.value)}
                    </span>
                    <span className="text-sm font-black text-leaf-600 uppercase">OFF</span>
                  </div>

                  <p className="text-xs text-stone-500 font-medium">
                    Valid on orders above <strong>{formatCurrency(promo.min_order)}</strong>
                  </p>

                  {/* Usage Progress bar */}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-500 font-semibold">
                      <span>Redemptions</span>
                      <span>
                        {promo.used_count || 0} / {promo.usage_limit || '∞'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium text-[11px]">Promo ID #{promo.id}</span>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                    title="Delete Promo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Promo Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Discount Voucher"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Promo Voucher Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SAMIGOLD"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-coffee-950 focus:outline-none focus:border-coffee-700"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ETB Amount</option>
                </select>
              </div>

              <Input
                label={formData.discountType === 'percentage' ? 'Percentage (e.g. 15)' : 'Amount (ETB)'}
                type="number"
                step="0.01"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.discountType === 'percentage' ? '15' : '100'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Order (ETB)"
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                placeholder="300"
              />
              <Input
                label="Max Usage Count"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 100 })}
                placeholder="100"
              />
            </div>

            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
                className="w-1/3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-2/3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
              >
                Launch Voucher
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
