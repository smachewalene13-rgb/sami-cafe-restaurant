import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Coffee, Utensils, ArrowRight, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function TableQRScan() {
  const { tableNumber } = useParams();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setOrderType, setTable: setStoreTable } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    reservationApi.getTables()
      .then((res) => {
        const found = (res.data || []).find(
          (t) => t.tableNumber.toLowerCase() === (tableNumber || '').toLowerCase()
        );
        if (found) {
          setTable(found);
          // Auto configure cart for this table
          setOrderType('dine_in');
          setStoreTable(found.id, found.tableNumber);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tableNumber]);

  if (loading) return <Loader text="Detecting table QR code..." />;

  const handleStartOrdering = () => {
    if (table) {
      setOrderType('dine_in');
      setStoreTable(table.id, table.tableNumber);
      toast.success(`Connected to Table ${table.tableNumber} (${table.location})`);
    }
    navigate('/menu');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-stone-200 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-coffee-800 text-cream flex items-center justify-center mx-auto shadow-md">
          <Coffee className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-leaf-50 text-leaf-800 border border-leaf-200">
            <Sparkles className="w-3.5 h-3.5 text-leaf-600" />
            Contactless QR Table Ordering
          </span>
          <h1 className="font-display font-bold text-3xl text-coffee-950 mt-1">
            Welcome to {table ? `Table ${table.tableNumber}` : `Table ${tableNumber || ''}`}
          </h1>
          <p className="text-xs text-stone-500">
            {table?.location ? `Location: ${table.location}` : 'Sami Cafe and Restaurant'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2 text-stone-600">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Table Verified & Synced</span>
          </div>
          <p>
            Your orders placed from this mobile device will be delivered directly to this table and dispatched instantly to the kitchen display.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartOrdering}
            className="w-full py-4 text-sm font-bold gap-2 shadow-lg"
          >
            <Utensils className="w-4 h-4" /> Open Digital Menu & Order
          </Button>

          <button
            onClick={() => navigate('/')}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Go to Cafe Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
