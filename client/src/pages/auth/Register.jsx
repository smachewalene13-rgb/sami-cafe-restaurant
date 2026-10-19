import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({ fullName, email, phone, password });
      setAuth(res.data.user, res.data.token);
      toast.success('🎉 Welcome to Sami Cafe and Restaurant family!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-stone-200 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coffee-900 to-coffee-950 text-gold-400 flex items-center justify-center mx-auto shadow-lg shadow-coffee-950/20 border border-gold-500/30">
            <Coffee className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 block">
            Join Sami Cafe Circle
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-coffee-950">
            Create an Account
          </h2>
          <p className="text-xs text-stone-500">
            Enjoy contactless table orders, online delivery, and exclusive promotions
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            required
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Martha Haile"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="martha@example.com"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 911 234 567"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <p className="flex items-center gap-1.5 font-bold text-coffee-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Member Privileges:
            </p>
            <p>• Save table preferences & fast Telebirr checkout</p>
            <p>• Live delivery order tracking with status updates</p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full py-3.5 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/20"
          >
            Create Customer Account &rarr;
          </Button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-coffee-900 hover:text-gold-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
