import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle, Coffee, Sparkles, MapPin, Award, Check } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function Reservation() {
  const { user } = useAuthStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(null);

  const [availableTables, setAvailableTables] = useState([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Auto check availability
  useEffect(() => {
    if (!date || !time) return;

    const check = async () => {
      setChecking(true);
      try {
        const res = await reservationApi.checkAvailability({
          date,
          time: `${time}:00`,
          guests,
        });
        const tables = res.data?.tables || [];
        setAvailableTables(tables);
        if (tables.length > 0 && !selectedTableId) {
          setSelectedTableId(tables[0].id);
        }
      } catch (err) {
        console.error('Failed to check availability:', err);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [date, time, guests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !phone) {
      toast.error('Please enter your name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reservationApi.createReservation({
        guestName,
        phone,
        reservationDate: date,
        startTime: `${time}:00`,
        guests: parseInt(guests, 10),
        tableId: selectedTableId || undefined,
        notes,
      });

      setConfirmedReservation(res.data);
      toast.success('Table reserved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to complete reservation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-coffee-600 block">
          Dining Concierge
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Reserve Your Table
        </h1>
        <p className="text-sm text-stone-500 font-normal">
          Whether joining us for an authentic Jebena coffee ceremony, a celebratory feast, or an intimate dinner.
        </p>
      </div>

      {confirmedReservation ? (
        <div className="bg-white rounded-3xl p-8 sm:p-14 shadow-warm-lg border border-emerald-200 text-center max-w-lg mx-auto animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Booking Confirmed
          </span>
          <h2 className="font-display text-3xl font-bold text-stone-900 mt-2">
            We Look Forward to Welcoming You!
          </h2>
          <p className="text-xs text-stone-400 mt-1">Confirmation Reference: #{confirmedReservation.id}</p>

          <div className="my-6 p-5 rounded-2xl bg-stone-50 text-left text-xs sm:text-sm space-y-3 border border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Guest Name:</span>
              <span className="font-bold text-stone-900">{confirmedReservation.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date & Time:</span>
              <span className="font-bold text-stone-900">
                {confirmedReservation.reservationDate} at {confirmedReservation.startTime.slice(0, 5)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Party Size:</span>
              <span className="font-bold text-stone-900">{confirmedReservation.guests} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Status:</span>
              <span className="font-extrabold text-emerald-600 uppercase text-xs">{confirmedReservation.status}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 mb-8 leading-relaxed">
            Our table host holds reserved tables for up to 15 minutes past the reservation time. For changes, please call <strong>+251 911 234 567</strong>.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md"
            onClick={() => setConfirmedReservation(null)}
          >
            Make Another Reservation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Visual Dining Zones & Atmosphere */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-warm border border-stone-200 aspect-4/3 bg-stone-950">
              <img
                src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop"
                alt="Sami Cafe Dining Atmosphere"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold-300 tracking-wider">
                  Atmospheric Dining
                </span>
                <h3 className="font-display font-bold text-xl text-white">
                  Addis Ababa's Cultural Oasis
                </h3>
                <p className="text-xs text-stone-300 font-light">
                  Choose between our lively indoor dining hall, serene garden terrace, or private cultural VIP lounge.
                </p>
              </div>
            </div>

            {/* Perks Cards */}
            <div className="bg-white rounded-3xl p-6 shadow-warm-sm border border-stone-200 space-y-4">
              <h4 className="font-display font-bold text-base text-stone-900">
                Reservation Benefits
              </h4>
              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-coffee-100 text-coffee-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span>Guaranteed table seating with zero wait times</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span>Traditional Jebena ceremony presentation upon request</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span>Dedicated waitstaff host & high-speed Wi-Fi access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-warm border border-stone-200">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Party Size */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-coffee-800 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Party Size (Number of Guests)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setGuests(num)}
                      className={`w-12 h-12 rounded-2xl text-xs font-bold transition-all ${
                        guests === num
                          ? 'bg-coffee-950 text-white shadow-md scale-105'
                          : 'bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Date & Time Picker */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-coffee-800 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Select Date & Time
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-500 font-semibold mb-1">
                      Date of Reservation
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-xs sm:text-sm font-bold bg-stone-50 focus:border-coffee-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 font-semibold mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-xs sm:text-sm font-bold bg-stone-50 focus:border-coffee-600 focus:bg-white focus:outline-none"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Available Seating Tables */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-coffee-800 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Choose Available Dining Table
                </label>

                {checking ? (
                  <p className="text-xs text-stone-500 py-4 italic">Checking table slots...</p>
                ) : availableTables.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No dedicated tables match this slot. Our host will assign seating on arrival.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availableTables.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setSelectedTableId(t.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          selectedTableId === t.id
                            ? 'border-coffee-950 bg-coffee-50 shadow-md ring-2 ring-coffee-700'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-sm text-stone-900">{t.tableNumber}</span>
                          <span className="text-[10px] text-stone-500 font-bold">{t.capacity} seats</span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">{t.location}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Contact Details */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-coffee-800 text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  Contact Information
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Dawit Alemu"
                  />
                  <Input
                    label="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 234 567"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Special Requests (Anniversary, Window booth, High chair)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Let us know how we can make your visit memorable..."
                    className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-xs focus:border-coffee-600 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full py-4 text-base font-bold shadow-xl shadow-coffee-950/20"
              >
                Confirm Table Reservation &rarr;
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
