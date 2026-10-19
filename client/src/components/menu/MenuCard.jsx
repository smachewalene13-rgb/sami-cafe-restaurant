import { useState } from 'react';
import { Star, Leaf, Clock, Plus, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const FALLBACK_DISH_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop';

export default function MenuCard({ item, onAdd, onClickDetail, hideIcons = false }) {
  const [addedAnim, setAddedAnim] = useState(false);
  const imageUrl = item.image_url || item.imageUrl || FALLBACK_DISH_IMG;

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAdd(item);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 900);
  };

  return (
    <div
      onClick={() => onClickDetail && onClickDetail(item)}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Visual Image Header */}
      <div className="relative h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover group-hover:scale-110 transition duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_DISH_IMG;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

        {/* Dietary Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.is_fasting || item.isFasting ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gold-500 text-stone-950 shadow-md backdrop-blur-md flex items-center gap-1">
              {!hideIcons && <Sparkles className="w-2.5 h-2.5" />} Tsom / Fasting
            </span>
          ) : null}
          {item.is_vegetarian || item.isVegetarian ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-leaf-600 text-white shadow-md backdrop-blur-md flex items-center gap-1">
              {!hideIcons && <Leaf className="w-2.5 h-2.5" />} Veg
            </span>
          ) : null}
        </div>

        {/* Rating Badge Top Right */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-stone-900 shadow-md backdrop-blur-md flex items-center gap-1">
          {!hideIcons && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
          <span>{item.avgRating || item.avg_rating || '5.0'}</span>
        </div>

        {/* Prep Time Bottom Left */}
        {(item.prep_minutes || item.prepMinutes) && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/10">
            {!hideIcons && <Clock className="w-3 h-3 text-gold-400" />}
            <span>{item.prep_minutes || item.prepMinutes} mins</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-coffee-600 block mb-1">
            {item.categoryName || item.category_name || 'Chef Specialty'}
          </span>
          <h3 className="font-display font-bold text-lg text-stone-900 group-hover:text-coffee-700 transition leading-snug">
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Price
            </span>
            <span className="font-display font-extrabold text-xl text-leaf-600 tracking-tight">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.is_available === false || item.isAvailable === false ? (
            <span className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-stone-100 text-stone-400 uppercase tracking-wider">
              Sold Out
            </span>
          ) : (
            <button
              onClick={handleAddClick}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                addedAnim
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-coffee-800 hover:bg-coffee-950 text-white hover:shadow-md hover:scale-105'
              }`}
            >
              {addedAnim ? (
                <>
                  {!hideIcons && <Check className="w-3.5 h-3.5 animate-scale" />} Added
                </>
              ) : (
                <>
                  {!hideIcons && <Plus className="w-3.5 h-3.5" />} Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
