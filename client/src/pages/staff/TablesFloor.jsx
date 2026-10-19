import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Users, RefreshCw, Plus, Check, Clock, Sparkles, UtensilsCrossed, ShieldAlert, Coffee, MapPin, Eye } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { TABLE_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function TablesFloor() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [zoneFilter, setZoneFilter] = useState('all');
  const navigate = useNavigate();

  const fetchTables = async () => {
    try {
      const res = await reservationApi.getTables();
      setTables(res.data || []);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Real-time table updates via socket
  useSocket('table:update', (updatedTable) => {
    setTables((prev) =>
      prev.map((t) => (t.id === updatedTable.id ? { ...t, ...updatedTable } : t))
    );
  });

  const handleUpdateStatus = async (tableId, newStatus) => {
    try {
      await reservationApi.updateTableStatus(tableId, newStatus);
      toast.success(`Table status changed to ${newStatus.toUpperCase()}`);
      setSelectedTable(null);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    }
  };

  if (loading) return <Loader text="Loading restaurant dining floor plan..." />;

  // Group zones
  const zones = ['all', ...new Set(tables.map((t) => t.location).filter(Boolean))];

  const filteredTables = tables.filter((t) => {
    if (zoneFilter !== 'all' && t.location !== zoneFilter) return false;
    return true;
  });

  const statusSummary = {
    free: tables.filter((t) => t.status === 'free').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
  };

  const occupancyRate = tables.length > 0 ? Math.round((statusSummary.occupied / tables.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Floor Overview Header */}
      <div className="bg-gradient-to-br from-coffee-950 via-stone-900 to-coffee-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Floor Architecture & Dining Plan
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white">
              Restaurant Tables & Seating
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              Real-time architectural view of Sami Cafe dining zones, booth allocations, and live dining occupancy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-stone-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-700/80 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Occupancy</span>
              <span className="font-display font-black text-2xl text-gold-400">{occupancyRate}%</span>
            </div>
            <div className="bg-stone-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-stone-700/80 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Seats</span>
              <span className="font-display font-black text-2xl text-emerald-400">
                {tables.reduce((acc, t) => acc + (t.capacity || 0), 0)}
              </span>
            </div>
            <button
              onClick={fetchTables}
              className="p-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition shadow-sm"
              title="Refresh Floor"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status Metric Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2.5 rounded-2xl">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Free</p>
              <p className="font-bold text-emerald-300 text-sm">{statusSummary.free} Tables</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-rose-950/40 border border-rose-500/30 px-3.5 py-2.5 rounded-2xl">
            <span className="w-3 h-3 rounded-full bg-rose-400 animate-pulse shadow-sm shadow-rose-400/50" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Occupied</p>
              <p className="font-bold text-rose-300 text-sm">{statusSummary.occupied} Tables</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-amber-950/40 border border-amber-500/30 px-3.5 py-2.5 rounded-2xl">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Reserved</p>
              <p className="font-bold text-amber-300 text-sm">{statusSummary.reserved} Tables</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-stone-800/80 border border-stone-600/30 px-3.5 py-2.5 rounded-2xl">
            <span className="w-3 h-3 rounded-full bg-stone-400" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Cleaning</p>
              <p className="font-bold text-stone-300 text-sm">{statusSummary.cleaning} Tables</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dining Zones Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setZoneFilter(zone)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
              zoneFilter === zone
                ? 'bg-coffee-900 text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            {zone === 'all' ? '🍽️ All Dining Zones' : `📍 ${zone}`}
          </button>
        ))}
      </div>

      {/* Architectural Dining Floor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTables.map((table) => {
          const isFree = table.status === 'free';
          const isOccupied = table.status === 'occupied';
          const isReserved = table.status === 'reserved';
          const isCleaning = table.status === 'cleaning';

          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`group relative rounded-3xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl ${
                isOccupied
                  ? 'bg-gradient-to-b from-rose-50/70 to-white border-rose-300 hover:border-rose-500 shadow-rose-100'
                  : isReserved
                  ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300 hover:border-amber-500 shadow-amber-100'
                  : isCleaning
                  ? 'bg-gradient-to-b from-stone-100/70 to-white border-stone-300 hover:border-stone-400 shadow-stone-100'
                  : 'bg-gradient-to-b from-emerald-50/60 to-white border-emerald-300 hover:border-emerald-500 shadow-emerald-100'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {table.location || 'Dining Hall'}
                  </span>
                  <h3 className="font-display font-black text-2xl text-coffee-950 mt-0.5">
                    {table.tableNumber}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                    isOccupied
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : isReserved
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : isCleaning
                      ? 'bg-stone-200 text-stone-800 border-stone-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {table.status}
                </span>
              </div>

              {/* Graphic Seat Visualization */}
              <div className="my-5 p-4 rounded-2xl bg-white/80 border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-coffee-900 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5 text-coffee-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-coffee-950 block">Capacity</span>
                    <span className="text-[11px] text-stone-500 font-medium">{table.capacity} Guests</span>
                  </div>
                </div>

                {/* Seats visual dots */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(table.capacity || 4, 8) }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-rose-400' : isFree ? 'bg-emerald-400' : 'bg-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Footer action prompt */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-coffee-900 group-hover:text-gold-600 transition">
                <span>Manage Table</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Management Modal */}
      {selectedTable && (
        <Modal
          isOpen={!!selectedTable}
          onClose={() => setSelectedTable(null)}
          title={`Table ${selectedTable.tableNumber} Management`}
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block uppercase font-bold text-[10px]">Dining Zone</span>
                <span className="font-bold text-coffee-950 text-sm">{selectedTable.location || 'Main Floor'}</span>
              </div>
              <div>
                <span className="text-stone-400 block uppercase font-bold text-[10px]">Capacity</span>
                <span className="font-bold text-coffee-950 text-sm">{selectedTable.capacity} Persons</span>
              </div>
              <div>
                <span className="text-stone-400 block uppercase font-bold text-[10px]">Current Status</span>
                <span className="font-black text-sm uppercase text-coffee-900">{selectedTable.status}</span>
              </div>
              <div>
                <span className="text-stone-400 block uppercase font-bold text-[10px]">Direct QR URL</span>
                <a
                  href={`/table/${selectedTable.tableNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold-600 hover:underline font-bold text-xs"
                >
                  View QR Page &rarr;
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Quick Status Switcher
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'free', label: '🟢 Free (Available)' },
                  { id: 'occupied', label: '🔴 Occupied (Seated)' },
                  { id: 'reserved', label: '🟡 Reserved' },
                  { id: 'cleaning', label: '🧹 Cleaning' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleUpdateStatus(selectedTable.id, st.id)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition ${
                      selectedTable.status === st.id
                        ? 'bg-coffee-950 text-white border-coffee-950 shadow-md'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="md"
                className="w-full py-3 bg-coffee-900 hover:bg-coffee-800 text-white font-bold"
                onClick={() => {
                  const tid = selectedTable.id;
                  setSelectedTable(null);
                  navigate(`/staff/orders?tableId=${tid}`);
                }}
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Take Order for {selectedTable.tableNumber}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
