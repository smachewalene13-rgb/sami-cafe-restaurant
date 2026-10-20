import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Leaf, Sparkles, X, Coffee, ArrowRight, ShoppingBag } from 'lucide-react';
import { menuApi } from '../../api/menu.api';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../../data/initialMenuData';
import MenuCard from '../../components/menu/MenuCard';
import ItemModal from '../../components/menu/ItemModal';
import Loader from '../../components/common/Loader';
import { useCartStore } from '../../store/cartStore';
import { useLangStore } from '../../store/langStore';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVegetarian, setOnlyVegetarian] = useState(false);
  const [onlyFasting, setOnlyFasting] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [loading, setLoading] = useState(false);
  const [activeItemModal, setActiveItemModal] = useState(null);

  const { addItem, getTotalItemCount, getTotal, openDrawer } = useCartStore();
  const { t } = useLangStore();

  const totalItemsCount = getTotalItemCount();

  // Load categories from API (fallback to initial if network slow)
  useEffect(() => {
    menuApi.getCategories().then((res) => {
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      }
    }).catch(console.error);
  }, []);

  // Fetch menu items from API or filter local items seamlessly
  useEffect(() => {
    let isCancelled = false;

    const params = {
      categoryId: selectedCategory || undefined,
      q: searchQuery || undefined,
      vegetarian: onlyVegetarian ? 'true' : undefined,
      fasting: onlyFasting ? 'true' : undefined,
      sort: sortBy,
      limit: 60,
    };

    menuApi.getMenuItems(params)
      .then((res) => {
        if (!isCancelled && res.data?.items && res.data.items.length > 0) {
          setMenuItems(res.data.items);
        } else if (!isCancelled) {
          // Filter local INITIAL_MENU_ITEMS fallback
          let filtered = [...INITIAL_MENU_ITEMS];
          if (selectedCategory) {
            filtered = filtered.filter(item => String(item.category_id) === String(selectedCategory));
          }
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
          }
          if (onlyVegetarian) {
            filtered = filtered.filter(item => item.is_vegetarian);
          }
          if (onlyFasting) {
            filtered = filtered.filter(item => item.is_fasting);
          }
          if (sortBy === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
          } else if (sortBy === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
          }
          setMenuItems(filtered);
        }
      })
      .catch((err) => {
        console.error('Live API fetch error, using instant local menu items:', err);
        // Fallback filter
        let filtered = [...INITIAL_MENU_ITEMS];
        if (selectedCategory) {
          filtered = filtered.filter(item => String(item.category_id) === String(selectedCategory));
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
        }
        if (onlyVegetarian) {
          filtered = filtered.filter(item => item.is_vegetarian);
        }
        if (onlyFasting) {
          filtered = filtered.filter(item => item.is_fasting);
        }
        if (sortBy === 'price_asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
          filtered.sort((a, b) => b.price - a.price);
        }
        setMenuItems(filtered);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, searchQuery, onlyVegetarian, onlyFasting, sortBy]);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = (item, quantity = 1, note = '') => {
    addItem(item, quantity, note);
    toast.success(`Added ${item.name} to cart!`, {
      icon: '🛍️',
      style: { borderRadius: '1rem', background: '#26160c', color: '#fff' },
    });
  };

  const getCategoryIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('breakfast')) return '🍳';
    if (lower.includes('coffee') || lower.includes('tea')) return '☕';
    if (lower.includes('juice')) return '🍹';
    if (lower.includes('main') || lower.includes('tibs')) return '🥩';
    if (lower.includes('fasting') || lower.includes('tsom')) return '🌱';
    if (lower.includes('pizza') || lower.includes('pasta')) return '🍕';
    if (lower.includes('dessert')) return '🍰';
    return '🍽️';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-coffee-600 block">
          Artisanal Ethiopian & Continental Gastronomy
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          {t('menu')}
        </h1>
        <p className="text-sm text-stone-500 font-normal">
          Explore our complete selection of authentic dishes, ceremonial coffees, and hand-crafted drinks.
        </p>
      </div>

      {/* Floating Category Tabs (Sticky) */}
      <div className="sticky top-20 z-30 bg-[#faf6f0]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          <button
            onClick={() => handleSelectCategory('')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              !selectedCategory
                ? 'bg-coffee-950 text-white shadow-md scale-105'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>🍽️</span>
            <span>{t('all')}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id.toString())}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === cat.id.toString()
                  ? 'bg-coffee-950 text-white shadow-md scale-105'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{getCategoryIcon(cat.name)}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Dietary Filters Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-warm-sm border border-stone-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-10 py-3 rounded-full border border-stone-200 bg-stone-50 text-xs sm:text-sm font-medium focus:border-coffee-600 focus:bg-white focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Fasting (Tsom) Filter */}
            <button
              onClick={() => setOnlyFasting(!onlyFasting)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                onlyFasting
                  ? 'bg-gold-500 text-stone-950 shadow-md ring-2 ring-gold-300'
                  : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('fasting')}</span>
            </button>

            {/* Vegetarian Filter */}
            <button
              onClick={() => setOnlyVegetarian(!onlyVegetarian)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                onlyVegetarian
                  ? 'bg-leaf-600 text-white shadow-md ring-2 ring-leaf-300'
                  : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{t('vegetarian')}</span>
            </button>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-full text-xs font-bold border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none"
            >
              <option value="default">Default Order</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <Loader text="Brewing menu selection..." />
      ) : menuItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-stone-900">No dishes match your filters</h3>
          <p className="text-xs text-stone-500">Try clearing your filters or searching for another ingredient.</p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              setOnlyFasting(false);
              setOnlyVegetarian(false);
            }}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-coffee-800 text-white hover:bg-coffee-950 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAdd={handleAddToCart}
              onClickDetail={(it) => setActiveItemModal(it)}
            />
          ))}
        </div>
      )}

      {/* Mobile Floating Cart Action Pill */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={openDrawer}
            className="w-full bg-coffee-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-gold-500/30 animate-fade-in-up"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-leaf-600 text-white flex items-center justify-center text-xs font-bold">
                {totalItemsCount}
              </div>
              <span className="text-sm font-bold">View Current Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-gold-400 text-base">
                {formatCurrency(getTotal())}
              </span>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      <ItemModal
        item={activeItemModal}
        isOpen={!!activeItemModal}
        onClose={() => setActiveItemModal(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
