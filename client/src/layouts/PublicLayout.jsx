import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import { Toaster } from 'react-hot-toast';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}
