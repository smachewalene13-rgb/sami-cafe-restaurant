import { useState } from 'react';
import { Smartphone, CheckCircle, ShieldCheck, QrCode, CreditCard, ArrowRight } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, order, onPaymentSuccess }) {
  const [gateway, setGateway] = useState('telebirr'); // 'telebirr', 'chapa', 'card'
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      // Generate a mock transaction reference
      const txRef = `TX-${gateway.toUpperCase()}-${Date.now().toString().slice(-6)}`;

      // Record cash/card/telebirr settlement directly
      await api.post('/payments/cash', {
        orderId: order.id,
        amount: order.total,
        method: gateway === 'telebirr' ? 'mobile_money' : gateway === 'card' ? 'card' : 'online',
        reference: txRef,
      });

      toast.success(`🎉 Payment of ${formatCurrency(order.total)} confirmed via ${gateway.toUpperCase()}!`);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay with Telebirr / Chapa" maxWidth="max-w-md">
      <div className="space-y-6 text-center">
        {/* Gateway Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-2xl">
          {[
            { id: 'telebirr', label: 'Telebirr', icon: Smartphone },
            { id: 'chapa', label: 'Chapa', icon: ShieldCheck },
            { id: 'card', label: 'Bank Card', icon: CreditCard },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setGateway(m.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  gateway === m.id
                    ? 'bg-white text-coffee-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {m.label}
              </button>
            );
          })}
        </div>

        {/* Payment Amount Display */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
          <span className="text-xs text-stone-500 font-medium">Order Total to Pay</span>
          <p className="font-display font-bold text-3xl text-leaf-600 mt-0.5">
            {formatCurrency(order.total)}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Order Ref #{order.orderNumber}</p>
        </div>

        {/* QR Code Graphic for Telebirr / Mobile Money */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-stone-200">
          <div className="w-36 h-36 bg-stone-50 rounded-xl border border-stone-200 p-2 flex items-center justify-center shadow-inner relative group">
            {/* Styled Ethiopian QR Code visual */}
            <div className="w-full h-full bg-coffee-900 rounded-lg p-2 text-white flex flex-col items-center justify-center space-y-1">
              <QrCode className="w-16 h-16 text-amber-300" />
              <span className="text-[9px] uppercase font-mono font-bold text-stone-300">
                {gateway.toUpperCase()} • SCAN TO PAY
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-medium mt-3">
            Scan with your {gateway === 'telebirr' ? 'Telebirr App' : 'Banking App'} or authorize below
          </p>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleSimulatePayment}
          className="w-full py-3.5 text-sm font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-1.5" /> Authorize & Complete Payment
        </Button>
      </div>
    </Modal>
  );
}
