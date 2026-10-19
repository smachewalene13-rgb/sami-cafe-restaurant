import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import CartItem from './CartItem';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    orderType,
    setOrderType,
    getSubtotal,
    getDeliveryFee,
    getTax,
    getTotal,
    discountAmount
  } = useCartStore();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-coffee-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-coffee-100 text-coffee-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-coffee-950">Your Order</h3>
                <p className="text-xs text-stone-500">{items.length} unique items</p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Type Selector */}
          <div className="p-4 bg-stone-50 border-b border-stone-100">
            <div className="grid grid-cols-3 gap-2 p-1 bg-white rounded-xl border border-stone-200">
              {[
                { id: 'dine_in', label: 'Dine-In' },
                { id: 'takeaway', label: 'Takeaway' },
                { id: 'delivery', label: 'Delivery' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setOrderType(type.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    orderType === type.id
                      ? 'bg-coffee-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-display text-lg font-semibold text-coffee-900">Your cart is empty</h4>
                <p className="text-sm text-stone-500 mt-1 max-w-xs">
                  Discover our freshly brewed Ethiopian coffee and handcrafted dishes.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6"
                  onClick={() => {
                    closeDrawer();
                    navigate('/menu');
                  }}
                >
                  Explore Menu
                </Button>
              </div>
            ) : (
              items.map((item, idx) => (
                <CartItem
                  key={`${item.id}-${idx}`}
                  item={item}
                  index={idx}
                  onUpdateQty={updateQuantity}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
              <div className="space-y-2 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatCurrency(getSubtotal())}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-leaf-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-stone-900">{formatCurrency(getDeliveryFee())}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (15%)</span>
                  <span className="font-medium text-stone-900">{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-coffee-950 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span className="text-leaf-600 font-display text-lg">{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
