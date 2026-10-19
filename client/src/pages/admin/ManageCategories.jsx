import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    sortOrder: 1,
  });

  const loadCategories = async () => {
    try {
      const res = await adminApi.getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      sortOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || cat.image_url || '',
      sortOrder: cat.sortOrder || cat.sort_order || 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await adminApi.updateCategory(editingCat.id, formData);
        toast.success('Category updated successfully');
      } else {
        await adminApi.createCategory(formData);
        toast.success('New menu category created');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category removed');
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Cannot delete category containing dishes');
    }
  };

  if (loading) return <Loader text="Loading menu categories..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Catalog Taxonomy
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Menu Categories & Groupings
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow border border-stone-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={cat.imageUrl || cat.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200'}
                alt={cat.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
                  Sort Order #{cat.sortOrder || cat.sort_order}
                </span>
                <h3 className="font-display font-black text-lg text-coffee-950 truncate mt-0.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{cat.description}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-leaf-600">
                  {cat.itemCount || 0} Dishes in Category
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(cat)} className="gap-1 text-xs font-bold text-stone-700">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCat ? 'Edit Category' : 'Create Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Traditional Ethiopian Specials"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of dishes in this section..."
                className="w-full text-xs rounded-2xl border border-stone-200 p-3 focus:outline-none focus:border-coffee-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cover Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              <Input
                label="Sort Order"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 1 })}
                placeholder="1"
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
                {editingCat ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
