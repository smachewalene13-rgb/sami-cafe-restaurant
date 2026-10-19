import { useState } from 'react';
import { Star, Leaf, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ItemModal({ item, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  if (!item) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity, specialNote);
    setQuantity(1);
    setSpecialNote('');
    onClose();
  };

  const imageUrl = item.image_url || item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name} maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-stone-100">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop';
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {item.is_fasting || item.isFasting ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow">
                Tsom / Fasting
              </span>
            ) : null}
            {item.is_vegetarian || item.isVegetarian ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-leaf-600 text-white shadow flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Vegetarian
              </span>
            ) : null}
          </div>
          {(item.prep_minutes || item.prepMinutes) && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-coffee-300" />
              <span>Estimated Prep: {item.prep_minutes || item.prepMinutes} minutes</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-coffee-600">
              {item.categoryName || item.category_name || 'Traditional & Gourmet'}
            </span>
            <div className="flex items-center gap-1 text-sm font-bold text-stone-800">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{item.avgRating || item.avg_rating || '5.0'}</span>
            </div>
          </div>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">{item.description}</p>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
            Special Instructions / Dietary Preferences
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="e.g. Extra spicy, no onions, extra honey..."
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-coffee-600 focus:outline-none"
          />
        </div>

        {/* Quantity and Add Action */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-stone-200 rounded-full p-1 bg-stone-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-stone-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-left">
              <span className="text-xs text-stone-400 block">Total</span>
              <span className="font-display font-bold text-xl text-leaf-600">
                {formatCurrency(item.price * quantity)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAdd}
            className="w-full sm:w-auto px-8 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Order
          </Button>
        </div>
      </div>
    </Modal>
  );
}
