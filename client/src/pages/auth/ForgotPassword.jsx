import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-coffee-800 text-cream flex items-center justify-center mx-auto shadow-md">
            <Coffee className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-coffee-950">Reset Password</h2>
          <p className="text-xs text-stone-500">
            Enter your email to receive a password reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm text-stone-700">
              We've dispatched password reset instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="inline-block mt-4">
              <Button variant="outline" size="sm">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full py-3 text-sm font-semibold mt-2"
            >
              Send Reset Instructions
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-coffee-700 font-semibold hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
