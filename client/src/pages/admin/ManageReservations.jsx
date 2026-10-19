import { useState, useEffect } from 'react';
import { CalendarCheck, Users, Clock, Check, X, Phone, RefreshCw, UserCheck, Calendar } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadReservations = async () => {
    try {
      const res = await reservationApi.getAllReservations({
        status: statusFilter || undefined,
      });
      setReservations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await reservationApi.updateStatus(id, status);
      toast.success(`Reservation status updated to ${status.toUpperCase()}`);
      loadReservations();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (loading) return <Loader text="Loading restaurant bookings concierge..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Guest Concierge & VIP Booking
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Table Reservations Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-coffee-950 shadow-xs focus:outline-none"
          >
            <option value="">All Reservation Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed / Seated</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          <Button variant="ghost" size="sm" onClick={loadReservations} className="bg-white border border-stone-200">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bookings Grid */}
      {reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-400">No reservations matching the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reservations.map((res) => {
            const isPending = res.status === 'pending';
            const isConfirmed = res.status === 'confirmed';

            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow border border-stone-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                        Booking #{res.id}
                      </span>
                      <h3 className="font-display font-black text-xl text-coffee-950 mt-0.5">
                        {res.guestName}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 text-xs text-stone-600">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-600" />
                      <span className="font-bold text-stone-900">{formatDate(res.reservationDate)}</span>
                      <span>at {res.startTime ? res.startTime.slice(0, 5) : '19:00'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-coffee-700" />
                      <span><strong>{res.guests} Guests</strong></span>
                      <span className="text-stone-400">•</span>
                      <span>Table: <strong className="text-coffee-950">{res.tableNumber || 'Auto-assign'}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <a href={`tel:${res.phone}`} className="font-mono text-coffee-900 font-bold hover:underline">
                        {res.phone}
                      </a>
                    </p>
                  </div>

                  {res.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 mt-3">
                      Guest Request: "{res.notes}"
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                  {isPending && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Confirm Booking
                    </Button>
                  )}
                  {isConfirmed && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs py-2 bg-coffee-900 hover:bg-coffee-800 text-white font-bold"
                      onClick={() => handleUpdateStatus(res.id, 'completed')}
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Seat Guests
                    </Button>
                  )}
                  {['pending', 'confirmed'].includes(res.status) && (
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      title="Cancel reservation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
