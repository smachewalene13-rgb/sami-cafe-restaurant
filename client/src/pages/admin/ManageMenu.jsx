import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Check, X, Coffee, Sparkles, Image as ImageIcon, Clock, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { menuApi } from '../../api/menu.api';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../../data/initialMenuData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function ManageMenu() {
  const [items, setItems] = useState(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    imageUrl: '',
    isVegetarian: false,
    isFasting: false,
    prepMinutes: 15,
  });

  const loadData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        menuApi.getMenuItems({ limit: 100 }),
        menuApi.getCategories(),
      ]);
      if (menuRes?.data?.items && menuRes.data.items.length > 0) {
        setItems(menuRes.data.items);
      }
      if (catRes?.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.warn('Live menu fetch warning:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      price: '',
      description: '',
      imageUrl: '',
      isVegetarian: false,
      isFasting: false,
      prepMinutes: 15,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId || item.category_id,
      price: item.price,
      description: item.description || '',
      imageUrl: item.imageUrl || item.image_url || '',
      isVegetarian: item.isVegetarian || item.is_vegetarian || false,
      isFasting: item.isFasting || item.is_fasting || false,
      prepMinutes: item.prepMinutes || item.prep_minutes || 15,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.updateMenuItem(editingItem.id, formData);
        toast.success('Dish updated successfully');
      } else {
        await adminApi.createMenuItem(formData);
        toast.success('New dish added to menu');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await adminApi.toggleItemAvailability(id, !currentStatus);
      toast.success('Availability changed');
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isAvailable: !currentStatus } : i))
      );
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu dish?')) return;
    try {
      await adminApi.deleteMenuItem(id);
      toast.success('Item removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (loading) return <Loader text="Loading culinary menu catalog..." />;

  const filtered = items.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.categoryName && i.categoryName.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || String(i.categoryId) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Catalog & Menu Engineering
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Dishes & Beverages Catalog
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add New Dish
        </Button>
      </div>

      {/* Controls Bar: Search & Category Pills */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by title, ingredient or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-medium focus:outline-none focus:border-coffee-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-coffee-950 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                String(selectedCategory) === String(c.id)
                  ? 'bg-coffee-950 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Dish</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Dietary</th>
                <th className="py-4 px-5">Prep Time</th>
                <th className="py-4 px-5">Availability</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=120'}
                        alt={item.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-coffee-950 text-sm">{item.name}</p>
                        <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-stone-700">
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-[11px]">
                      {item.categoryName}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-display font-black text-leaf-600 text-sm">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex gap-1.5">
                      {item.isFasting && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                          Tsom
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-leaf-100 text-leaf-800">
                          Veg
                        </span>
                      )}
                      {!item.isFasting && !item.isVegetarian && (
                        <span className="text-stone-300 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-stone-600 font-medium">
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {item.prepMinutes || 15} mins
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-2xs ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-200 text-stone-600 border border-stone-300'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-coffee-950 transition"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Culinary Dish' : 'Add New Dish to Menu'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Dish Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Special Derek Tibs"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-coffee-950 focus:outline-none focus:border-coffee-700"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (ETB)"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="450.00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe flavors, traditional spices, and ingredients..."
                className="w-full text-xs rounded-2xl border border-stone-200 p-3 focus:outline-none focus:border-coffee-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              <Input
                label="Prep Minutes"
                type="number"
                value={formData.prepMinutes}
                onChange={(e) => setFormData({ ...formData, prepMinutes: parseInt(e.target.value, 10) || 15 })}
                placeholder="15"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFasting}
                  onChange={(e) => setFormData({ ...formData, isFasting: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>Tsom / Fasting Friendly</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Vegetarian</span>
              </label>
            </div>

            <div className="pt-4 flex gap-3">
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
                {editingItem ? 'Save Changes' : 'Create Dish'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
