import { Coffee, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#19120c] via-[#140e0a] to-[#0c0805] text-stone-300 pt-16 pb-12 mt-auto border-t border-amber-500/20 shadow-2xl relative overflow-hidden">
      {/* Subtle Warm Ambient Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-36 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/90">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
                <Coffee className="w-6 h-6 text-stone-950" />
              </div>
              <span className="font-display font-black text-2xl text-white tracking-tight">
                Sami Cafe
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed font-normal">
              Serving the authentic heritage of Ethiopian highland coffees, time-honored traditional dishes, and modern artisanal cuisine with warm hospitality.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/70 shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Open Daily from 7:00 AM - 11:00 PM
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white text-lg mb-4 tracking-tight">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/menu" className="text-stone-400 hover:text-amber-400 transition hover:translate-x-1 inline-block">
                  Our Menu & Specials
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="text-stone-400 hover:text-amber-400 transition hover:translate-x-1 inline-block">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-stone-400 hover:text-amber-400 transition hover:translate-x-1 inline-block">
                  Photo Gallery & Ambience
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-400 hover:text-amber-400 transition hover:translate-x-1 inline-block">
                  Our Coffee Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-amber-400 transition hover:translate-x-1 inline-block">
                  Find Us & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-display font-bold text-white text-lg mb-4 tracking-tight">
              Opening Hours
            </h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700/80 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">Monday - Sunday</p>
                  <p className="text-stone-400 text-xs">07:00 AM - 11:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700/80 text-amber-400 flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">Traditional Jebena Ceremony</p>
                  <p className="text-stone-400 text-xs">Fresh batches at 10 AM, 2 PM, 5 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display font-bold text-white text-lg mb-4 tracking-tight">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-stone-300 leading-snug">
                  Injibara, Ethiopia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-stone-200 font-semibold">
                  +251 940039167
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-stone-200 font-semibold">
                  info@samicafe.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Sami Cafe and Restaurant. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium text-stone-300">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in Injibara, Ethiopia by Sami Cafe Team
          </p>
        </div>
      </div>
    </footer>
  );
}
