import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Grid, Users, Sparkles, MapPin } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { reservationApi } from '../../api/reservation.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { TABLE_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ManageTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    location: 'Main Dining Hall',
  });

  const loadTables = async () => {
    try {
      const res = await reservationApi.getTables();
      setTables(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenCreate = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: `T-0${tables.length + 1}`,
      capacity: 4,
      location: 'Main Dining Hall',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTable(t);
    setFormData({
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      location: t.location || 'Main Dining Hall',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await adminApi.updateTable(editingTable.id, formData);
        toast.success('Table updated successfully');
      } else {
        await adminApi.createTable(formData);
        toast.success('New table added to dining layout');
      }
      setIsModalOpen(false);
      loadTables();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await adminApi.deleteTable(id);
      toast.success('Table removed');
      loadTables();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (loading) return <Loader text="Loading dining floor layout..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Architectural Floor Layout
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Dining Tables & Seating Configuration
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Dining Table
        </Button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {tables.map((t) => {
          const config = TABLE_STATUSES[t.status] || TABLE_STATUSES.free;

          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow border border-stone-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {t.location || 'Main Floor'}
                    </span>
                    <h3 className="font-display font-black text-2xl text-coffee-950 mt-0.5">
                      {t.tableNumber}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
                    {t.status}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-2 text-xs font-semibold text-stone-700">
                  <Users className="w-4 h-4 text-coffee-700" />
                  <span>Max {t.capacity} Persons</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <a
                  href={`/table/${t.tableNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-gold-600 hover:underline"
                >
                  QR View &rarr;
                </a>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(t)} className="p-1.5 text-stone-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="p-1.5 text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTable ? 'Edit Table Settings' : 'Add New Table'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Table Number / Code"
              required
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              placeholder="e.g. T-09 or VIP-01"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Seating Capacity (Guests)"
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 4 })}
                placeholder="4"
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Dining Zone / Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-coffee-950 focus:outline-none"
                >
                  <option value="Main Dining Hall">Main Dining Hall</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="Terrace / Balcony">Terrace / Balcony</option>
                  <option value="Outdoor Garden">Outdoor Garden</option>
                  <option value="Bar & Coffee Counter">Bar & Coffee Counter</option>
                </select>
              </div>
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
                {editingTable ? 'Save Table' : 'Add Table'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
