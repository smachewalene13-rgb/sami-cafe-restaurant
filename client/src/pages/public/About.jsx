import { Coffee, Award, Heart, Users, MapPin, CheckCircle, Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function About() {
  return (
    <div className="space-y-20 py-12">
      {/* Editorial Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Our Heritage & Philosophy
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-coffee-950 leading-[1.15]">
              Centuries of Flavor, <br />
              <span className="italic text-gold-600 font-serif">Crafted for Modern Dining.</span>
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Founded in the vibrant Bole district of Addis Ababa, <strong>Sami Cafe and Restaurant</strong> celebrates the sacred Ethiopian tradition of communal eating—where every shared platter (<em>Agelgil</em>) and cup of Jebena Buna deepens the bonds of friendship and family.
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              From organic heirloom coffee cherries picked in Sidama and Yirgacheffe to freshly baked Teff Injera and succulent Derek Tibs sizzled over charcoal embers, our kitchen honors ancestral culinary techniques while welcoming international guests with modern elegance.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link to="/menu">
                <Button variant="primary" size="lg" className="py-3.5 px-8 font-black bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xl shadow-amber-500/20">
                  Explore Culinary Menu &rarr;
                </Button>
              </Link>
              <Link to="/reservation">
                <Button variant="outline" size="lg" className="py-3.5 px-6 font-bold border-stone-300 text-stone-800 hover:bg-stone-50">
                  Book VIP Table
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white h-72 sm:h-80 w-full group bg-stone-900">
                <img
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop"
                  alt="Sami Cafe Interior & Traditional Coffee Ritual"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coffee-950/85 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold-400">
                    Injibara, Ethiopia
                  </span>
                  <p className="font-display font-black text-lg">The Hearth of Ethiopian Hospitality</p>
                </div>
              </div>

              {/* Floating Achievement Card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3.5 shadow-xl border border-stone-200 hidden sm:flex items-center gap-3 max-w-[260px]">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-black text-sm text-coffee-950">Addis Dining Awards</p>
                  <p className="text-[10px] text-stone-500 leading-tight">Best Cultural Gastronomy & Coffee 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Terroir Showcase */}
      <section className="bg-gradient-to-b from-stone-900 to-coffee-950 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-black text-gold-400 block">
              Direct-Trade Single Origins
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
              The Birthplace of Arabica Coffee
            </h2>
            <p className="text-sm text-stone-300">
              Every coffee bean served at Sami Cafe is roasted on-site daily in our custom German drum roasters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                region: 'Yirgacheffe',
                elevation: '1,900 – 2,200m',
                flavor: 'Bergamot, Jasmine, Sweet Lemon & Peach',
                desc: 'Renowned globally for delicate floral aromas and silky tea-like elegance.',
              },
              {
                region: 'Sidama',
                elevation: '1,800 – 2,000m',
                flavor: 'Blueberry, Dark Cocoa & Cane Sugar',
                desc: 'Vibrant fruit acidity and full rounded body, perfect for bold morning Jebena pours.',
              },
              {
                region: 'Harar',
                elevation: '1,500 – 2,100m',
                flavor: 'Wild Berry, Spice & Dark Chocolate',
                desc: 'Sun-dried natural processed cherries yielding intense winey sweetness and spice notes.',
              },
            ].map((c, i) => (
              <div
                key={i}
                className="bg-stone-900/80 backdrop-blur-md rounded-3xl p-6 border border-stone-800 hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider">
                      {c.elevation}
                    </span>
                    <Coffee className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-display font-black text-2xl text-white">{c.region}</h3>
                  <p className="text-xs text-gold-300 font-bold">{c.flavor}</p>
                  <p className="text-xs text-stone-400 leading-relaxed pt-1">{c.desc}</p>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300 font-bold">
                  <span>Available at Espresso Bar</span>
                  <span className="text-gold-400">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values / Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs uppercase tracking-widest font-black text-gold-600">The Sami Standard</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-coffee-950">
            Our Pillars of Hospitality
          </h2>
          <p className="text-sm text-stone-600">
            Excellence that touches every guest interaction from kitchen stove to table.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition border border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-inner">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="font-display font-black text-xl text-coffee-950">Ancestral Clay Cooking</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We slow-cook our sauces (Wat) in earthen clay pots with hand-ground Berbere and spiced Clarified Butter (Niter Kibbeh) for authentic depth.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition border border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-display font-black text-xl text-coffee-950">Strict Dietary Honor</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Dedicated fasting kitchens for Wednesdays & Fridays with pristine vegetarian platters, ensuring 100% adherence to Ethiopian Orthodox traditions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition border border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-coffee-100 text-coffee-900 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-display font-black text-xl text-coffee-950">Warm Gursha Spirit</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              More than dining—our team embraces every guest as family. Expect generous portions, attentive service, and joyous hospitality.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
