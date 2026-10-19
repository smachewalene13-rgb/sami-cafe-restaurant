import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Coffee,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  UtensilsCrossed,
  MonitorPlay,
  Grid,
  Receipt,
  Globe,
  Sparkles,
  UserPlus,
  LogIn,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useLangStore } from '../../store/langStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { getTotalItemCount, openDrawer } = useCartStore();
  const { lang, toggleLang, t } = useLangStore();
  const navigate = useNavigate();

  const cartCount = getTotalItemCount();

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@samicafe.com';
  const userAvatar = isAdmin
    ? (user?.avatarUrl || '/images/simachew-profile.png')
    : (user?.avatarUrl && user.avatarUrl !== '/images/simachew-profile.png' ? user.avatarUrl : null);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('menu'), path: '/menu' },
    { name: t('reservations'), path: '/reservation' },
    { name: t('about'), path: '/about' },
    { name: t('gallery'), path: '/gallery' },
    { name: t('contact'), path: '/contact' },
  ];

  const isStaffOrAdmin = user && ['admin', 'manager', 'waiter', 'kitchen', 'cashier'].includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo (Logo mark only, text removed as requested) */}
          <Link to="/" className="flex items-center group shrink-0" title="Sami Cafe & Restaurant">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-coffee-800 to-coffee-950 text-gold-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-gold-500/20">
              <Coffee className="w-6 h-6" />
            </div>
          </Link>

          {/* Desktop Nav Links (Equal distance between each navigation item, no wrapping) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap mx-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs xl:text-sm font-bold uppercase tracking-wider transition-all duration-150 whitespace-nowrap py-1.5 ${
                    isActive
                      ? 'text-coffee-950 font-black border-b-2 border-amber-500'
                      : 'text-stone-600 hover:text-coffee-950'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Consolidated Staff / Admin Hub Button (Single clean pill instead of 5 sprawling buttons) */}
            {isStaffOrAdmin && (
              <Link
                to={['admin', 'manager'].includes(user.role) ? '/admin' : '/staff/orders'}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-stone-900 text-gold-400 hover:bg-stone-800 transition shadow-2xs border border-stone-700"
              >
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                <span>{['admin', 'manager'].includes(user.role) ? 'Admin Hub' : 'Staff Portal'}</span>
              </Link>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-stone-200 text-xs font-bold text-coffee-950 hover:bg-stone-50 transition shadow-2xs"
              title="Switch Language / ቋንቋ ቀይር"
            >
              <Globe className="w-3.5 h-3.5 text-gold-600" />
              <span>{lang === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className="relative p-2 rounded-full text-stone-700 hover:bg-stone-100 transition focus:outline-none"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-coffee-900" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-leaf-600 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-scale shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In / Sign Up Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition text-xs font-bold text-stone-800 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-500/40 bg-stone-900 flex items-center justify-center text-[11px] font-black shrink-0">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover object-top" />
                      ) : (
                        <span className="text-gold-400">{user.fullName ? user.fullName[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <span className="hidden sm:inline max-w-[90px] truncate">{user.fullName || 'User'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-stone-200 py-2.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-amber-500/30 bg-stone-900 shrink-0">
                          {userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-gold-400">
                              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">{user.fullName}</p>
                          <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20">
                            Role: {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-coffee-950 transition"
                        >
                          📦 My Orders & Tracking
                        </Link>
                        <Link
                          to="/my-reservations"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-coffee-950 transition"
                        >
                          📅 My Table Bookings
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-coffee-950 transition"
                        >
                          ⚙️ Account Profile
                        </Link>
                      </div>

                      {isStaffOrAdmin && (
                        <div className="pt-1.5 border-t border-stone-100">
                          <Link
                            to={['admin', 'manager'].includes(user.role) ? '/admin' : '/staff/orders'}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2 text-xs font-black text-amber-700 hover:bg-amber-50 transition"
                          >
                            👑 Open Control Hub &rarr;
                          </Link>
                        </div>
                      )}

                      <div className="pt-1.5 border-t border-stone-100 space-y-1">
                        <Link
                          to="/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-1.5 text-xs font-bold text-coffee-800 hover:bg-coffee-50 transition"
                        >
                          🔄 Switch Account / Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-1.5 text-xs font-bold text-coffee-800 hover:bg-coffee-50 transition"
                        >
                          ✨ Register New User
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Sign In / Switch link always visible */}
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-stone-600 hover:text-coffee-950 hover:bg-stone-100 transition"
                  title="Sign In with another account"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Link>

                {/* Direct Sign Up link always visible */}
                <Link
                  to="/register"
                  className="hidden md:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-black bg-coffee-950 hover:bg-coffee-900 text-white shadow-xs transition"
                  title="Create a new account"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </Link>
              </div>
            ) : (
              /* When not logged in: prominent Sign In and Sign Up buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-coffee-950 hover:bg-stone-100 transition flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-stone-200 px-6 py-6 space-y-5 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Sign In & Sign Up Action Strip */}
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-center text-xs font-bold text-coffee-950 hover:bg-stone-100 flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-gold-600" /> Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 rounded-2xl bg-amber-500 text-stone-950 text-center text-xs font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </Link>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-stone-800 hover:text-coffee-950 hover:bg-stone-50 rounded-xl px-2 transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {isStaffOrAdmin && (
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                Staff Operations Portal
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['admin', 'manager'].includes(user.role) && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 text-xs font-bold rounded-xl bg-stone-900 text-gold-400 flex items-center gap-1.5"
                  >
                    👑 Admin Hub
                  </Link>
                )}
                {['admin', 'manager', 'kitchen'].includes(user.role) && (
                  <Link
                    to="/staff/kitchen"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 text-xs font-bold rounded-xl bg-purple-50 text-purple-800 flex items-center gap-1.5"
                  >
                    🍳 Kitchen KDS
                  </Link>
                )}
                {['admin', 'manager', 'waiter'].includes(user.role) && (
                  <Link
                    to="/staff/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 flex items-center gap-1.5"
                  >
                    🧑‍🍳 Waiter POS
                  </Link>
                )}
                {['admin', 'manager', 'cashier'].includes(user.role) && (
                  <Link
                    to="/staff/billing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 flex items-center gap-1.5"
                  >
                    💳 Cashier POS
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
