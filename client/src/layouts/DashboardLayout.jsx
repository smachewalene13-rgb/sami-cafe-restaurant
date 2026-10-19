import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  CalendarCheck,
  Grid,
  Boxes,
  Tag,
  Users,
  BarChart3,
  Settings,
  Coffee,
  LogOut,
  ExternalLink,
  Receipt,
  MonitorPlay,
  ChevronDown,
  Activity,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      id: 'operations',
      title: 'Operations',
      shortTitle: 'Operations',
      roles: ['admin', 'manager', 'waiter', 'kitchen', 'cashier'],
      items: [
        { name: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'manager'] },
        { name: 'Waiter Order Desk', path: '/staff/orders', icon: UtensilsCrossed, roles: ['admin', 'manager', 'waiter'] },
        { name: 'Kitchen KDS Station', path: '/staff/kitchen', icon: MonitorPlay, roles: ['admin', 'manager', 'kitchen'] },
        { name: 'Floor & Seating Plan', path: '/staff/tables', icon: Grid, roles: ['admin', 'manager', 'waiter'] },
        { name: 'Billing & Cashier POS', path: '/staff/billing', icon: Receipt, roles: ['admin', 'manager', 'cashier'] },
      ],
    },
    {
      id: 'management',
      title: 'Menu & Orders',
      shortTitle: 'Menu & Orders',
      roles: ['admin', 'manager'],
      items: [
        { name: 'Dishes & Drinks Catalog', path: '/admin/menu', icon: Coffee, roles: ['admin', 'manager'] },
        { name: 'Menu Categories', path: '/admin/categories', icon: Layers, roles: ['admin', 'manager'] },
        { name: 'Customer Orders Ledger', path: '/admin/orders', icon: ShoppingBag, roles: ['admin', 'manager'] },
        { name: 'Table Reservations Log', path: '/admin/reservations', icon: CalendarCheck, roles: ['admin', 'manager'] },
        { name: 'Dining Table Config', path: '/admin/tables', icon: Grid, roles: ['admin'] },
      ],
    },
    {
      id: 'intelligence',
      title: 'Auditing & Settings',
      shortTitle: 'Auditing & Settings',
      roles: ['admin', 'manager'],
      items: [
        { name: 'Inventory & Pantry Stock', path: '/admin/inventory', icon: Boxes, roles: ['admin', 'manager'] },
        { name: 'Sales & Revenue Reports', path: '/admin/reports', icon: BarChart3, roles: ['admin', 'manager'] },
        { name: 'Promotions & Vouchers', path: '/admin/promotions', icon: Tag, roles: ['admin', 'manager'] },
        { name: 'Staff Directory & Roles', path: '/admin/users', icon: Users, roles: ['admin'] },
        { name: 'System Parameters', path: '/admin/settings', icon: Settings, roles: ['admin'] },
      ],
    },
  ];

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@samicafe.com';
  const displayName = isAdmin
    ? (user?.fullName || 'Simachew Alene (Owner)')
    : (user?.fullName || 'Staff Member');
  const userAvatar = isAdmin
    ? (user?.avatarUrl || '/images/simachew-profile.png')
    : (user?.avatarUrl && user.avatarUrl !== '/images/simachew-profile.png' ? user.avatarUrl : null);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-stone-900 font-sans antialiased flex flex-col">
      <Toaster position="top-right" />

      {/* Transparent Click Backdrop to Close Dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#121214] text-stone-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-stone-800 shadow-2xl lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800 bg-[#0e0e10]">
          <span className="font-display font-black text-white text-base">Sami Cafe Control Hub</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section) => {
            const allowed = section.items.filter((it) => it.roles.includes(user?.role));
            if (allowed.length === 0) return null;
            return (
              <div key={section.id} className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2">
                  {section.title}
                </p>
                {allowed.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'text-stone-400 hover:text-white hover:bg-stone-800'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-stone-800 bg-[#0e0e10] space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" /> Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Modern Sleek Top Header (Toggles Removed, Replaced with Clean Dropdown Navigation) */}
      <header className="sticky top-0 z-40 bg-[#0e0e10] text-stone-300 border-b border-stone-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
              title="Open Navigation Menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-lg text-white block leading-tight tracking-tight">
                  Sami Cafe
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-bold block">
                  Control Hub • Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Dropdown Menus (No Clunky Toggle Bars) */}
          <nav className="hidden lg:flex items-center gap-1.5 relative z-40">
            {navSections.map((section) => {
              const allowed = section.items.filter((it) => it.roles.includes(user?.role));
              if (allowed.length === 0) return null;

              const isSectionActive = allowed.some((it) =>
                it.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(it.path)
              );
              const isOpen = openDropdown === section.id;

              return (
                <div key={section.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : section.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none ${
                      isSectionActive
                        ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    <span>{section.title}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* Clean Dropdown Popover */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#141416] border border-stone-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 border-b border-stone-800/80 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          {section.title}
                        </span>
                      </div>

                      <div className="space-y-0.5 px-1.5">
                        {allowed.map((item) => {
                          const Icon = item.icon;
                          const isCurrent =
                            item.path === '/admin'
                              ? location.pathname === '/admin'
                              : location.pathname.startsWith(item.path);

                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              end={item.path === '/admin'}
                              onClick={() => setOpenDropdown(null)}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                  isActive
                                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/70'
                                }`
                              }
                            >
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isCurrent ? 'text-stone-950' : 'text-stone-400'
                                }`}
                              />
                              <span className={isCurrent ? 'text-stone-950' : 'text-stone-300'}>
                                {item.name}
                              </span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Owner Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Staff / Owner Identity Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-stone-900/80 border border-stone-800">
              <div className="w-7 h-7 rounded-xl overflow-hidden bg-stone-800 border border-amber-500/30 flex items-center justify-center shrink-0 text-xs font-black text-amber-400">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span>{displayName[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-black uppercase text-amber-400">
                    {user?.role || 'staff'}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">• Online</span>
                </div>
              </div>
            </div>

            {/* Public Storefront Link */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-300 hover:text-white bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden md:inline">Storefront</span>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-xl transition hover:bg-rose-950/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Routed Page Content (100% Full Page - Starts Immediately Below Header) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
