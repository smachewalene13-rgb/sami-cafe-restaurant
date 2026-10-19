import { useState } from 'react';
import { Sparkles, X, Maximize2, Camera } from 'lucide-react';

export default function Gallery() {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop',
      title: 'Traditional Jebena Coffee Ceremony Ritual',
      category: 'Coffee Heritage',
      description: 'Hand-roasted organic Sidama beans brewed in clay Jebena with frankincense smoke.',
    },
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
      title: 'Sizzling Derek Tibs on Clay Shigolo Brazier',
      category: 'Main Dishes',
      description: 'Tender beef tips sautéed with rosemary, red onions, garlic, and hot green peppers.',
    },
    {
      url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&auto=format&fit=crop',
      title: 'Artisan Fresh Spris Layered Juice',
      category: 'Beverages',
      description: 'Freshly squeezed mango, avocado, and papaya served with fresh lime wedge.',
    },
    {
      url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop',
      title: 'Grand Fasting Beyaynetu Platter',
      category: 'Fasting Dishes',
      description: 'Ten authentic fasting stews including Misir Wat, Shiro, Gomen, and Kik Alicha.',
    },
    {
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop',
      title: 'Artisan Wood-Fired Gourmet Pizza',
      category: 'Gourmet',
      description: 'Crisp sourdough crust topped with spiced minced beef, mozzarella, and basil.',
    },
    {
      url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1200&auto=format&fit=crop',
      title: 'Special Layered Ethiopian Macchiato',
      category: 'Coffee Heritage',
      description: 'Addis Ababa specialty espresso layered gracefully with steamed whole milk.',
    },
    {
      url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&auto=format&fit=crop',
      title: 'Artisan Honey & Walnut Baklava',
      category: 'Desserts',
      description: 'Flaky filo pastry steeped in organic Ethiopian highland white honey.',
    },
    {
      url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&auto=format&fit=crop',
      title: 'Traditional Chechebsa with Spiced Niter Kibbeh',
      category: 'Breakfast',
      description: 'Warm pan-fried flatbread pieces tossed in fragrant spiced butter and berbere.',
    },
  ];

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filters = ['All', 'Coffee Heritage', 'Main Dishes', 'Beverages', 'Fasting Dishes', 'Gourmet', 'Desserts', 'Breakfast'];

  const filteredImages = activeFilter === 'All'
    ? images
    : images.filter((img) => img.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
          <Camera className="w-3.5 h-3.5 text-gold-600" /> Visual Dining Atmosphere
        </span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-coffee-950">
          Photo Gallery & Ambiance
        </h1>
        <p className="text-sm text-stone-600">
          Immerse yourself in the aromas, vivid colors, and cultural beauty of Sami Cafe and Restaurant in Addis Ababa.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
              activeFilter === f
                ? 'bg-coffee-950 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredImages.map((img, i) => (
          <div
            key={i}
            onClick={() => setSelectedPhoto(img)}
            className="group relative rounded-3xl overflow-hidden aspect-4/3 shadow-md hover:shadow-2xl transition duration-300 cursor-pointer border border-stone-200"
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-coffee-950/90 via-coffee-950/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-5 text-white">
              <span className="text-[10px] uppercase font-black text-gold-400 tracking-wider">
                {img.category}
              </span>
              <h4 className="font-display font-bold text-base leading-snug mt-1 text-white">
                {img.title}
              </h4>
              <span className="text-[11px] text-stone-300 mt-1 flex items-center gap-1 font-medium">
                <Maximize2 className="w-3 h-3 text-gold-400" /> Tap to expand
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-800/80 text-white flex items-center justify-center hover:bg-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-16/10 w-full overflow-hidden bg-black">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 text-white space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-400">
                {selectedPhoto.category}
              </span>
              <h3 className="font-display font-black text-xl text-white">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedPhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
