import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Sparkles,
  Lock,
  ArrowRight,
  Smartphone,
  Building2
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi, paymentApi, userApi } from '../../services/api';
import { useDeviceMode } from '../../context/DeviceModeContext';

const defaultDemoAddress = {
  _id: 'default-address-1',
  label: 'Home',
  addressLine: '14, 2nd Cross Street, Gandhi Nagar, Adyar',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600020',
};

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart() || {};
  const { user, updateLocalUser, activeAddress: globalActiveAddress, selectActiveAddress, saveUserAddress } = useAuth();
  const { isMobileView } = useDeviceMode();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  // Address state
  const userAddresses = user?.addresses?.length ? user.addresses : (globalActiveAddress ? [globalActiveAddress] : [defaultDemoAddress]);
  const [selectedAddressId, setSelectedAddressId] = useState(
    globalActiveAddress?._id || user?.addresses?.find((a) => a.isDefault)?._id || userAddresses[0]?._id
  );

  // Edit / Add address modal or inline form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    addressLine: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020',
  });

  // Payment method: 'razorpay' (online) vs 'cod' (cash on delivery) vs 'wallet'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Online Payment Gateway Modal state
  const [showOnlinePaymentModal, setShowOnlinePaymentModal] = useState(false);
  const [onlineTab, setOnlineTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 8921 7843 9012',
    name: user?.name || 'Customer Name',
    expiry: '08/28',
    cvv: '891',
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Selected address object
  const activeAddress =
    userAddresses.find((a) => a._id === selectedAddressId) || userAddresses[0] || defaultDemoAddress;

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      addressLine: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600020',
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr, e) => {
    e?.stopPropagation();
    setEditingAddressId(addr._id);
    setAddressForm({
      label: addr.label || 'Home',
      addressLine: addr.addressLine || '',
      city: addr.city || 'Chennai',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '600020',
    });
    setShowAddressModal(true);
  };

  const handleSaveAddressForm = async (e) => {
    e?.preventDefault();
    if (!addressForm.addressLine) {
      setError('Please enter a valid street address');
      return;
    }

    try {
      const res = await saveUserAddress(addressForm, editingAddressId);
      if (res?.activeAddress?._id) {
        setSelectedAddressId(res.activeAddress._id);
      }
    } catch (_) {
      const updatedList = editingAddressId
        ? userAddresses.map((a) => (a._id === editingAddressId ? { ...a, ...addressForm } : a))
        : [...userAddresses, { ...addressForm, _id: 'addr-' + Date.now() }];
      updateLocalUser({ addresses: updatedList });
      if (!editingAddressId) {
        setSelectedAddressId(updatedList[updatedList.length - 1]._id);
      }
    }

    setShowAddressModal(false);
    setError('');
  };

  // 1. Process COD Order
  const handlePlaceCodOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const { data } = await orderApi.place({
        addressId: selectedAddressId,
        deliveryAddress: activeAddress,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        items: items.map((i) => ({
          food: i.food?._id || i.food,
          name: i.food?.name,
          price: i.food?.discountPrice || i.food?.price || 169,
          quantity: i.quantity || 1,
        })),
      });

      await clearCart?.();
      navigate(`/order-confirmed/${data.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order. Please check address.');
      setPlacing(false);
    }
  };

  // 2. Complete Online Payment & Place Confirmed Order
  const handleExecuteOnlinePayment = async () => {
    setIsProcessingPayment(true);

    // Simulate 2s secure payment gateway verification with bank
    setTimeout(async () => {
      try {
        const paymentId = `PAY_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

        const { data } = await orderApi.place({
          addressId: selectedAddressId,
          deliveryAddress: activeAddress,
          paymentMethod: 'razorpay',
          paymentStatus: 'paid',
          paymentId,
          items: items.map((i) => ({
            food: i.food?._id || i.food,
            name: i.food?.name,
            price: i.food?.discountPrice || i.food?.price || 169,
            quantity: i.quantity || 1,
          })),
        });

        setPaymentSuccess(true);
        await clearCart?.();

        setTimeout(() => {
          setIsProcessingPayment(false);
          setShowOnlinePaymentModal(false);
          navigate(`/order-confirmed/${data.data.order._id}`);
        }, 1200);
      } catch (err) {
        setIsProcessingPayment(false);
        setError(err.response?.data?.message || 'Payment authorization failed');
      }
    }, 1800);
  };

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      {!isMobileView ? (
        /* ========================================================================= */
        /* 1. DESKTOP VIEW                                                           */
        /* ========================================================================= */
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            <DesktopSidebar activeItem="orders" />

            <div className="flex-1 min-w-0 space-y-6">
              
              {/* Top Navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 transition"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Cart</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck size={14} />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
              </div>

              {/* Two Column Layout: Address & Payment vs Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: 1. Delivery Address + 2. Payment Method */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Address Section */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                          1
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                          Delivery Address
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddAddress}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                      >
                        <Plus size={14} />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    {/* Address Cards List */}
                    <div className="space-y-3">
                      {userAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => {
                              setSelectedAddressId(addr._id);
                              selectActiveAddress(addr);
                            }}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start justify-between ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                                  isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                                    {addr.label || 'Home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-bold text-slate-400">Default</span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                                  {addr.addressLine}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleOpenEditAddress(addr, e)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-100 transition flex items-center gap-1"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                        2
                      </div>
                      <h3 className="text-base font-black text-slate-900">
                        Choose Payment Method
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: Online Payment */}
                      <div
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                          paymentMethod === 'razorpay'
                            ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'razorpay' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900">Online Payment</p>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Instant
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, UPI, Cards, NetBanking</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}`}>
                          {paymentMethod === 'razorpay' && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Option 2: Cash on Delivery */}
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                          paymentMethod === 'cod'
                            ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Banknote size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</p>
                            <p className="text-xs text-slate-500">Pay cash or UPI to delivery rider upon hot delivery</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}`}>
                          {paymentMethod === 'cod' && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT: Order Summary & Place Order Action */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-md space-y-5 sticky top-28">
                  <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                    Order Summary
                  </h3>

                  {/* Items Mini List */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">
                          {it.quantity} × {it.food?.name || 'Healthy Dish'}
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{(it.food?.discountPrice || it.food?.price || 169) * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Calculations */}
                  <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Partner Fee</span>
                      <span className="font-bold text-slate-900">
                        {deliveryFee === 0 ? <span className="text-emerald-600 uppercase font-black">FREE</span> : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Hygiene Packaging (5%)</span>
                      <span className="font-bold text-slate-900">₹{tax}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                      <span>Grand Total</span>
                      <span className="text-purple-700 text-lg">₹{total}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Order Button based on Payment Selection */}
                  {paymentMethod === 'razorpay' ? (
                    <button
                      type="button"
                      onClick={() => setShowOnlinePaymentModal(true)}
                      disabled={placing || isProcessingPayment}
                      className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-xl shadow-purple-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Lock size={16} />
                      <span>Proceed to Online Payment (₹{total})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePlaceCodOrder}
                      disabled={placing}
                      className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{placing ? 'Placing Order...' : `Confirm Order (Cash on Delivery ₹${total})`}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}

                  <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>FSSAI Certified Fresh Homemade Meals</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW                                                            */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto pb-28">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-base font-black text-slate-900">Checkout & Payment</h1>
            <div className="w-8" />
          </div>

          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-purple-600" />
                <span>Delivery Address</span>
              </span>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                + New
              </button>
            </div>

            {userAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              return (
                <div
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddressId(addr._id);
                    selectActiveAddress(addr);
                  }}
                  className={`p-3 rounded-2xl border-2 transition flex items-start justify-between ${
                    isSelected ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {addr.label || 'Home'}
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">{addr.addressLine}</p>
                      <p className="text-[11px] text-slate-500">{addr.city} - {addr.pincode}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleOpenEditAddress(addr, e)}
                    className="text-xs font-bold text-purple-700 px-2 py-1"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100">
              Select Payment Method
            </h3>

            <div className="space-y-2">
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                  paymentMethod === 'razorpay' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-purple-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900">Online Payment</p>
                    <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}`}>
                  {paymentMethod === 'razorpay' && <Check size={10} strokeWidth={3} />}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                  paymentMethod === 'cod' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900">Cash on Delivery</p>
                    <p className="text-[10px] text-slate-500">Pay cash or UPI upon delivery</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}`}>
                  {paymentMethod === 'cod' && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bill Summary */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2 text-xs">
            <h3 className="font-black text-slate-900 pb-2 border-b border-slate-100">Bill Breakdown</h3>
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span className="font-bold text-slate-900">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5%)</span>
              <span className="font-bold text-slate-900">₹{tax}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-slate-900">
              <span>Grand Total</span>
              <span className="text-purple-700">₹{total}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Sticky Mobile Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 z-30 max-w-md mx-auto">
            {paymentMethod === 'razorpay' ? (
              <button
                type="button"
                onClick={() => setShowOnlinePaymentModal(true)}
                disabled={placing || isProcessingPayment}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xl shadow-purple-500/30 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Lock size={14} />
                <span>Pay Online ₹{total} & Confirm Order</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceCodOrder}
                disabled={placing}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xl active:scale-95 transition"
              >
                {placing ? 'Placing Order...' : `Confirm Order (COD ₹${total})`}
              </button>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EDIT / ADD ADDRESS MODAL                                               */}
      {/* ========================================================================= */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveAddressForm} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Label</label>
                <input
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="e.g. Home, Work, Apartment"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  placeholder="Flat No, Street Name, Area"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95 mt-2"
              >
                Save & Use This Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE ONLINE PAYMENT GATEWAY MODAL                                */}
      {/* ========================================================================= */}
      {showOnlinePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100 animate-fade-in relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">NutriFit Secure Checkout</h3>
                  <p className="text-[10px] text-slate-400">Total Payable: <b className="text-purple-700">₹{total}</b></p>
                </div>
              </div>

              {!isProcessingPayment && (
                <button
                  type="button"
                  onClick={() => setShowOnlinePaymentModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Payment Mode Segmented Tabs */}
            {!paymentSuccess ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setOnlineTab('upi')}
                    className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                      onlineTab === 'upi' ? 'bg-white text-purple-700 shadow-xs' : ''
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineTab('card')}
                    className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                      onlineTab === 'card' ? 'bg-white text-purple-700 shadow-xs' : ''
                    }`}
                  >
                    <CreditCard size={13} />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineTab('netbanking')}
                    className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                      onlineTab === 'netbanking' ? 'bg-white text-purple-700 shadow-xs' : ''
                    }`}
                  >
                    <Building2 size={13} />
                    <span>NetBanking</span>
                  </button>
                </div>

                {/* Tab 1: UPI */}
                {onlineTab === 'upi' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700">Pay via Instant UPI App</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                        <div
                          key={app}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-800 hover:border-purple-500 cursor-pointer"
                        >
                          {app}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Or Enter UPI ID / VPA</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 2: Credit / Debit Card */}
                {onlineTab === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: NetBanking */}
                {onlineTab === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600">Select Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                        <div
                          key={b}
                          onClick={() => setSelectedBank(b)}
                          className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center ${
                            selectedBank === b ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200'
                          }`}
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pay Action Button */}
                <button
                  type="button"
                  onClick={handleExecuteOnlinePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-xl shadow-purple-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing ₹{total} with Bank...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Pay ₹{total} Now</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Payment Success Screen */
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-3xl shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-base font-black text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500">₹{total} paid securely. Placing your order now...</p>
              </div>
            )}

            <div className="pt-2 text-center text-[10px] text-slate-400">
              🔒 Powered by NutriFit 256-bit Bank Grade Security
            </div>
          </div>
        </div>
      )}

    </MobileLayout>
  );
};

export default Checkout;
