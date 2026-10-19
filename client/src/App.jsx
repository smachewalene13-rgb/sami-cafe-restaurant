import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Public Pages
import Home from './pages/public/Home';
import Menu from './pages/public/Menu';
import Reservation from './pages/public/Reservation';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Gallery from './pages/public/Gallery';
import TableQRScan from './pages/public/TableQRScan';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Customer Pages
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import MyOrders from './pages/customer/MyOrders';
import MyReservations from './pages/customer/MyReservations';
import Profile from './pages/customer/Profile';

// Staff Operations Pages
import WaiterOrders from './pages/staff/WaiterOrders';
import KitchenDisplay from './pages/staff/KitchenDisplay';
import TablesFloor from './pages/staff/TablesFloor';
import Billing from './pages/staff/Billing';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders from './pages/admin/ManageOrders';
import ManageReservations from './pages/admin/ManageReservations';
import ManageTables from './pages/admin/ManageTables';
import Inventory from './pages/admin/Inventory';
import Promotions from './pages/admin/Promotions';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/table/:tableNumber" element={<TableQRScan />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Checkout & Tracking (Accessible by guests & logged in) */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders/:id" element={<OrderTracking />} />

        {/* Customer Account Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Staff & Admin Operational Portal */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Staff Accessible Operations */}
          <Route element={<RoleRoute roles={['admin', 'manager', 'waiter']} />}>
            <Route path="/staff/orders" element={<WaiterOrders />} />
            <Route path="/staff/tables" element={<TablesFloor />} />
          </Route>

          <Route element={<RoleRoute roles={['admin', 'manager', 'kitchen']} />}>
            <Route path="/staff/kitchen" element={<KitchenDisplay />} />
          </Route>

          <Route element={<RoleRoute roles={['admin', 'manager', 'cashier']} />}>
            <Route path="/staff/billing" element={<Billing />} />
          </Route>

          {/* Admin & Manager Operations */}
          <Route element={<RoleRoute roles={['admin', 'manager']} />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/menu" element={<ManageMenu />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/orders" element={<ManageOrders />} />
            <Route path="/admin/reservations" element={<ManageReservations />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/promotions" element={<Promotions />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Admin Exclusive */}
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/admin/tables" element={<ManageTables />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
