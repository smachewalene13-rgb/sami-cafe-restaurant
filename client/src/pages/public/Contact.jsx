import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, Sparkles, Navigation } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Table Booking & VIP Inquiries');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const subjects = [
    'Table Booking & VIP Inquiries',
    'Private Event & Catering',
    'Traditional Coffee Ceremony',
    'General Feedback & Management',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please complete all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('🎉 Thank you! Your message has been dispatched to our concierge team.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Guest Concierge Desk
        </span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-coffee-950">
          We’d Love to Host You
        </h1>
        <p className="text-sm text-stone-600">
          Have an inquiry, planning a cultural banquet, or want to reserve our VIP lounge? Reach out to our hospitality team in Bole, Addis Ababa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-black text-2xl text-coffee-950">Message Received!</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Thank you for contacting Sami Cafe and Restaurant. Our guest concierge will get in touch with you shortly at <strong>{email}</strong>.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="mt-4 font-bold"
              >
                Send Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-display font-black text-xl text-coffee-950">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">We typically reply within 2 hours</p>
              </div>

              {/* Inquiry Type Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Inquiry Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        subject === s
                          ? 'bg-coffee-950 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Almaz Bekele"
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="almaz@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  How can our team assist you?
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your event, dietary preferences, or party size..."
                  className="w-full rounded-2xl border border-stone-200 p-3.5 text-xs text-stone-800 focus:outline-none focus:border-coffee-700 focus:ring-1 focus:ring-coffee-700"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-3.5 rounded-2xl font-black bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 gap-2 flex items-center justify-center"
              >
                <Send className="w-4 h-4 fill-stone-950" /> Send Inquiry to Concierge
              </Button>
            </form>
          )}
        </div>

        {/* Contact Info & Location Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-coffee-950 via-stone-900 to-coffee-900 text-white rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden border border-stone-800">
            <div className="absolute top-0 right-0 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-400 block">
                Flagship Dining Room
              </span>
              <h3 className="font-display font-black text-2xl text-white mt-1">
                Sami Cafe & Restaurant
              </h3>
              <p className="text-xs text-stone-300 mt-1">Injibara  , Ethiopia</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Physical Address</p>
                  <p className="text-stone-300 mt-0.5">
                    Injibara  , Ethiopia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Phone className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Direct Line / Reservations</p>
                  <p className="font-mono text-gold-300 font-bold mt-0.5">
                    +251 940039167
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Mail className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Official Correspondence</p>
                  <p className="text-stone-300 mt-0.5">
                    contact@samicafe.com • reservations@samicafe.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Dining Hours</p>
                  <p className="text-stone-300 mt-0.5">
                    Monday to Sunday: 7:00 AM – 11:00 PM (Daily)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-2 border border-stone-700 transition"
              >
                <Navigation className="w-4 h-4 text-gold-400" /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
