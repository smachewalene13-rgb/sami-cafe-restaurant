import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, Users, MapPin, Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatDate';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationApi.getMyReservations()
      .then((res) => {
        setReservations(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Connecting to Table Booking Concierge..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Dining Concierge
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-coffee-950 mt-1">
            My Table Reservations
          </h1>
        </div>

        <Link to="/reservation">
          <Button
            variant="primary"
            size="md"
            className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Book New Table
          </Button>
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 rounded-full bg-coffee-100 text-coffee-800 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-display font-black text-2xl text-coffee-950">No reservations booked yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Reserve an intimate dining booth, VIP lounge table, or outdoor terrace for your next visit.
          </p>
          <Link to="/reservation" className="inline-block pt-2">
            <Button variant="primary" size="md" className="font-bold bg-amber-500 hover:bg-amber-600 text-stone-950">
              Book a Table &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'confirmed';
            const isPending = res.status === 'pending';
            const isCancelled = res.status === 'cancelled';

            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 border border-stone-200 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs text-stone-400">
                      REF #{res.id}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 text-xs text-stone-600">
                    <p className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-gold-600" />
                      <span className="font-bold text-stone-900">{formatDate(res.reservationDate)}</span>
                      <span>at {res.startTime ? res.startTime.slice(0, 5) : '19:00'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-coffee-700" />
                      <span><strong>{res.guests} Guests</strong></span>
                    </p>
                    {res.tableNumber && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Table {res.tableNumber} ({res.location || 'Main Floor'})</span>
                      </p>
                    )}
                  </div>

                  {res.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 mt-3">
                      Special Request: "{res.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>Guest: {res.guestName}</span>
                  <span className="font-mono text-coffee-950 font-bold">{res.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
