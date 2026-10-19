import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, ChefHat, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide your email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.fullName}!`);

      const role = res.data.user.role;
      if (['admin', 'manager'].includes(role)) {
        navigate('/admin');
      } else if (role === 'kitchen') {
        navigate('/staff/kitchen');
      } else if (role === 'waiter') {
        navigate('/staff/orders');
      } else if (role === 'cashier') {
        navigate('/staff/billing');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, roleName) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    try {
      const res = await authApi.login({ email: demoEmail, password: 'password123' });
      setAuth(res.data.user, res.data.token);
      toast.success(`Logged in as ${res.data.user.fullName} (${roleName})!`);

      const role = res.data.user.role;
      if (['admin', 'manager'].includes(role)) {
        navigate('/admin');
      } else if (role === 'kitchen') {
        navigate('/staff/kitchen');
      } else if (role === 'waiter') {
        navigate('/staff/orders');
      } else if (role === 'cashier') {
        navigate('/staff/billing');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      toast.error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-stone-200 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coffee-900 to-coffee-950 text-gold-400 flex items-center justify-center mx-auto shadow-lg shadow-coffee-950/20 border border-gold-500/30">
            <Coffee className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 block">
            Sami Cafe & Restaurant
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-coffee-950">
            Sign In to Portal
          </h2>
          <p className="text-xs text-stone-500">
            Access online dining orders, table bookings, or staff terminal
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="bg-gradient-to-br from-coffee-50 via-cream/80 to-amber-50/50 p-4 rounded-2xl border border-coffee-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-coffee-900">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              1-Click Instant Demo Roles:
            </span>
            <span className="text-[10px] text-stone-400 font-mono">pwd: password123</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@samicafe.com', 'Admin')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-coffee-950 hover:bg-coffee-900 hover:text-white transition shadow-2xs text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('manager@samicafe.com', 'Manager')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-coffee-950 hover:bg-coffee-900 hover:text-white transition shadow-2xs text-center"
            >
              📋 Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('kitchen@samicafe.com', 'Kitchen')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-coffee-950 hover:bg-coffee-900 hover:text-white transition shadow-2xs text-center"
            >
              🍳 Kitchen
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('waiter@samicafe.com', 'Waiter')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-coffee-950 hover:bg-coffee-900 hover:text-white transition shadow-2xs text-center"
            >
              🧑‍🍳 Waiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('cashier@samicafe.com', 'Cashier')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-coffee-950 hover:bg-coffee-900 hover:text-white transition shadow-2xs text-center"
            >
              💳 Cashier
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer@samicafe.com', 'Customer')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-coffee-950 hover:bg-coffee-900 hover:text-white transition shadow-2xs text-center"
            >
              👤 Customer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-gold-600 hover:text-gold-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-coffee-950 focus:outline-none focus:border-coffee-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full py-3.5 rounded-2xl gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/20"
          >
            Sign In &rarr;
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-coffee-900 hover:text-gold-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
