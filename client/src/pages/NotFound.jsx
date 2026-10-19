import { Link } from 'react-router-dom';
import { Coffee, ArrowLeft, Utensils, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-5 relative">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-coffee-900 to-coffee-950 text-gold-400 flex items-center justify-center mx-auto shadow-2xl border border-gold-500/20">
        <Coffee className="w-12 h-12" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Error 404
        </span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-coffee-950">
          Page Off the Menu
        </h1>
        <p className="text-sm text-stone-500 leading-relaxed">
          The requested page or culinary dish could not be located. Let's return you to our dining room for freshly brewed Jebena coffee and gourmet specialties.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button
            variant="primary"
            size="lg"
            className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
        <Link to="/menu">
          <Button variant="outline" size="lg" className="gap-2 font-bold border-stone-300 text-stone-800">
            <Utensils className="w-4 h-4" /> Explore Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}
