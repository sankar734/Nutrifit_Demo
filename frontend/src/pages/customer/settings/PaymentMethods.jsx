import { CreditCard, Wallet, Plus } from 'lucide-react';
import Header from '../../../components/customer/Header';
import MobileLayout from '../../../components/customer/MobileLayout';
import { useAuth } from '../../../context/AuthContext';

const PaymentMethods = () => {
  const { user } = useAuth();

  return (
    <MobileLayout showNav={false}>
      <Header title="Payment Methods" showBack />
      <div className="px-5 flex flex-col gap-4">
        <div className="bg-primary-gradient rounded-card p-4 text-white shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet size={22} />
            <div>
              <p className="text-sm font-semibold">NutriChef Wallet</p>
              <p className="text-xs text-white/80">Balance: ₹{user?.walletBalance ?? 0}</p>
            </div>
          </div>
          <button className="bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-pill">Add Money</button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-sm font-semibold text-ink">Saved Cards & UPI</p>
            <button className="text-primary text-xs font-semibold flex items-center gap-1">
              <Plus size={14} /> Add New
            </button>
          </div>
          <div className="bg-white rounded-card shadow-glass border border-lavender/60 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-primary">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">UPI / Razorpay Checkout</p>
                <p className="text-xs text-muted">Pay via any UPI app, card or net banking at checkout</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-lavender rounded-card p-4">
          <p className="text-xs text-muted">
            NutriChef uses Razorpay for secure UPI, card and net banking payments — your card details are never stored
            on our servers.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PaymentMethods;
