import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuApi } from '../../api/menu.api';
import MenuCard from '../../components/menu/MenuCard';
import ItemModal from '../../components/menu/ItemModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useCartStore } from '../../store/cartStore';
import { useLangStore } from '../../store/langStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [specials, setSpecials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItemModal, setActiveItemModal] = useState(null);

  const { addItem } = useCartStore();
  const { t, lang } = useLangStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, menuRes] = await Promise.all([
          menuApi.getCategories(),
          menuApi.getMenuItems({ limit: 8 }),
        ]);
        setCategories(catsRes.data || []);
        setSpecials(menuRes.data?.items || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleAddToCart = (item, quantity = 1, note = '') => {
    addItem(item, quantity, note);
    toast.success(`Added ${item.name} to cart!`, {
      style: { borderRadius: '1rem', background: '#26160c', color: '#fff' },
    });
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. Hero Section - Ultra Luxury Restaurant Layout */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-stone-950 text-white overflow-hidden pt-6 pb-20">
        {/* Ambient Glows & Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1920&auto=format&fit=crop"
            alt="Ethiopian Coffee Ceremony & Traditional Cuisine"
            className="w-full h-full object-cover opacity-25 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-stone-950/50" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-coffee-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                   Sami cafe &Restaurant <br />
                <span className="italic font-light text-cream bg-gradient-to-r from-gold-300 via-amber-100 to-coffee-300 bg-clip-text text-transparent">
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-stone-300 font-light leading-relaxed">
                premium culinary destination and digital restaurant platform celebrating authentic Ethiopian highland gastronomy, time-honored hospitality, and world-renowned specialty coffee traditions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/menu')}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-coffee-600 hover:bg-coffee-700 text-white shadow-xl shadow-coffee-950/50 hover:scale-105 transition-all"
                >
                  {t('orderNow')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/reservation')}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold border-stone-600 hover:border-gold-400 text-white hover:bg-white/10 transition-all"
                >
                  {t('bookTable')}
                </Button>
              </div>

              {/* Verified Trust Badges (No Icons) */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs font-medium">
                <span className="px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300">
                  Fresh Single Origin
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300">
                  Fasting / Veg Ready
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300">
                  Instant Delivery
                </span>
              </div>
            </div>

            {/* Right Column: Floating Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card (Clean Portrait of Sami Cafe, No Text Over Head) */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-stone-800 aspect-4/5 bg-stone-900 group">
                  <img
                    src="/images/sami-cafe.jpg"
                    alt="Sami Cafe"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-90" />
                  
                  {/* Bottom Info */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                    <h3 className="font-display font-bold text-3xl text-white">
                      Sami Cafe
                    </h3>
                    <div>
                      <button
                        onClick={() => navigate('/menu')}
                        className="px-6 py-2.5 rounded-full bg-white text-stone-950 text-xs font-bold hover:bg-gold-300 transition shadow-md"
                      >
                        Explore Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Stats Bar (Clean Typography, No Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white rounded-3xl p-6 sm:p-8 shadow-warm border border-stone-200">
          <div className="text-center sm:text-left sm:border-r border-stone-200 sm:pr-6 space-y-1">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-coffee-800">
              15,000+
            </span>
            <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Happy Guests</p>
            <p className="text-[11px] text-stone-500">Addis locals & international diners</p>
          </div>

          <div className="text-center sm:text-left sm:border-r border-stone-200 sm:pr-6 space-y-1">
            <div className="flex items-baseline justify-center sm:justify-start gap-1">
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-coffee-800">4.9</span>
              <span className="text-sm font-bold text-amber-600">/ 5.0</span>
            </div>
            <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Culinary Rating</p>
            <p className="text-[11px] text-stone-500">Across Google & local reviews</p>
          </div>

          <div className="text-center sm:text-left sm:border-r border-stone-200 sm:pr-6 space-y-1">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-leaf-600">
              100%
            </span>
            <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Single Origin</p>
            <p className="text-[11px] text-stone-500">Yirgacheffe & Sidama Grade 1</p>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-coffee-800">
              20 Min
            </span>
            <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Average Prep Time</p>
            <p className="text-[11px] text-stone-500">Live KDS dispatched flow</p>
          </div>
        </div>
      </section>

      {/* 3. Category Showcase with Food Cards (No Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-coffee-600 block mb-1">
              Curated Masterpieces
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {t('categories')}
            </h2>
          </div>
          <Link
            to="/menu"
            className="mt-3 md:mt-0 inline-flex items-center text-xs font-extrabold text-coffee-800 hover:text-coffee-950 uppercase tracking-wider hover:underline transition"
          >
            Full Catalog
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.id}`}
              className="group relative rounded-3xl overflow-hidden h-48 sm:h-56 bg-stone-950 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
            >
              <img
                src={cat.imageUrl || cat.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold text-gold-300 tracking-wider">
                  {cat.itemCount || 0} Special dishes
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl leading-tight group-hover:text-gold-300 transition mt-0.5">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-300 mt-1 line-clamp-1 opacity-90">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Specials Grid (No Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-extrabold text-coffee-600 block">
            Handcrafted Perfection
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
            {t('popularDishes')}
          </h2>
          <p className="text-sm text-stone-500 font-normal">
            Cooked freshly on order with clarified spiced butter (Kibe), authentic Berbere, and organic local farm produce.
          </p>
        </div>

        {loading ? (
          <Loader text="Brewing our dishes..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specials.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                hideIcons={true}
                onAdd={handleAddToCart}
                onClickDetail={(it) => setActiveItemModal(it)}
              />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/menu')}
            className="px-10 py-4 text-base font-bold shadow-xl shadow-coffee-950/10 hover:scale-105"
          >
            Explore All 17+ Gourmet Dishes
          </Button>
        </div>
      </section>

      {/* 5. Authentic Ethiopian Coffee Ceremony Section (No Icons) */}
      <section className="bg-stone-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-coffee-800/30 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-stone-900 border border-gold-500/40 text-gold-300 text-xs font-bold uppercase tracking-wider">
                An Ancient Ethiopian Living Ritual
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.1] text-white">
                {t('coffeeCeremonyTitle')}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                {t('coffeeCeremonyDesc')}
              </p>

              <div className="pt-2">
                <Link to="/reservation">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold px-8 shadow-xl"
                  >
                    Book Coffee Ceremony Experience
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 w-full max-w-xs sm:max-w-sm h-64 sm:h-72 bg-stone-900">
                <img
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&auto=format&fit=crop"
                  alt="Ethiopian Jebena Ceremony & Popcorn"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Instant Reservation CTA Banner (No Icons) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 text-white overflow-hidden bg-gradient-to-r from-stone-950 via-coffee-950 to-stone-950 border border-stone-800 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gold-400">
                Guaranteed Seating
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
                Reserve Your Gathering or Intimate Table
              </h3>
              <p className="text-stone-300 text-sm max-w-lg font-light">
                Select your preferred dining zone—Main Dining Hall, Garden Terrace, or VIP Cultural Lounge with instant confirmation.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/reservation')}
              className="px-8 py-4 text-base font-bold bg-gold-500 hover:bg-gold-400 text-stone-950 shadow-xl flex-shrink-0"
            >
              Check Availability Now
            </Button>
          </div>
        </div>
      </section>

      {/* Item Detail Modal */}
      <ItemModal
        item={activeItemModal}
        isOpen={!!activeItemModal}
        onClose={() => setActiveItemModal(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
