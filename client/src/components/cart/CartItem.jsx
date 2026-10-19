import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartItem({ item, index, onUpdateQty, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-b-0">
      <img
        src={item.image_url || item.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300'}
        alt={item.name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-coffee-950 truncate">{item.name}</h4>
        <p className="text-xs text-leaf-600 font-medium">{formatCurrency(item.price)}</p>
        {item.note && (
          <p className="text-[11px] text-stone-500 italic truncate mt-0.5">"{item.note}"</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-1">
        <button
          onClick={() => onUpdateQty(index, -1)}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-stone-700 transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold px-1 text-stone-800">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(index, 1)}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-stone-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition"
        title="Remove"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
