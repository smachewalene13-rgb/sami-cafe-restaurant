import { useState } from 'react';
import { User, Phone, Mail, Shield, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@samicafe.com';
  const defaultAvatar = isAdmin
    ? (user?.avatarUrl || '/images/simachew-profile.png')
    : (user?.avatarUrl && user.avatarUrl !== '/images/simachew-profile.png' ? user.avatarUrl : '');
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.updateProfile({ fullName, phone, avatarUrl });
      updateUser(res.data);
      toast.success('🎉 Profile information updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gold-100 text-gold-900 border border-gold-300">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Member Account
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-coffee-950 mt-1">
          Profile & Preferences
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
        {/* User Identity Header with Profile Photo */}
        <div className="flex items-center gap-4 sm:gap-5 pb-6 border-b border-stone-100">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-lg border-2 border-amber-500/40 bg-stone-900 flex items-center justify-center ring-4 ring-amber-500/10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullName || 'Profile Avatar'}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-coffee-800 to-coffee-950 text-gold-400 flex items-center justify-center font-black text-2xl">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md border-2 border-white text-xs font-black">
              ✓
            </div>
          </div>

          <div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-coffee-950 leading-tight">
              {user?.fullName || (isAdmin ? 'Simachew Alene (Owner)' : 'User')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-coffee-100 text-coffee-900 border border-coffee-200">
                Role: {user?.role || 'admin'}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Member
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your Name"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 911 234 567"
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Email Address (Protected Identifier)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 py-2.5 text-stone-500 text-xs font-medium cursor-not-allowed select-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
