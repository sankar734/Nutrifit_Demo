import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileLayout from '../../components/customer/MobileLayout';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const Cart = () => {
  const { cart, updateItem, clearCart, subtotal } = useCart() || {};
  const { t } = useLanguage() || { t: (k) => k };
  const navigate = useNavigate();
  const items = (cart?.items || []).filter((i) => i && i.food);
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center mb-6 shadow-inner text-4xl">
            🥑
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">Your Healthy Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-2">
            Explore delicious, nutrient-calculated meals cooked with love by verified home chefs.
          </p>
          <Link
            to="/search"
            className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl transition transform active:scale-95"
          >
            Explore Healthy Dishes
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Your Nutritious Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Freshly prepared on demand and delivered hot right to your doorstep.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item, idx) => {
            const fId = item.food._id || item.food.id || item.food;
            return (
              <div
                key={fId || idx}
                className="flex items-center gap-4 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                  {item.food.images?.[0] ? (
                    <img src={item.food.images[0]} alt={item.food.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🥗</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {item.food.chef?.kitchenName || 'Certified Home Kitchen'}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-800 truncate mt-1">
                    {item.food.name || 'Delicious Dish'}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    ₹{item.food.discountPrice || item.food.price || 0}
                    {item.food.nutrition?.calories && (
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        · {item.food.nutrition.calories} kcal
                      </span>
                    )}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      item.quantity <= 1 ? updateItem(fId, 0, item.food) : updateItem(fId, item.quantity - 1, item.food)
                    }
                    className="w-7 h-7 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center justify-center font-bold shadow-xs transition"
                  >
                    {item.quantity <= 1 ? <Trash2 size={13} className="text-rose-500" /> : <Minus size={13} />}
                  </button>

                  <span className="text-xs sm:text-sm font-black w-5 text-center text-slate-800">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateItem(fId, item.quantity + 1, item.food)}
                    className="w-7 h-7 rounded-xl bg-white hover:bg-purple-50 text-purple-700 flex items-center justify-center font-bold shadow-xs transition"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Bill Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl space-y-5 sticky top-24">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Bill & Nutrition Summary
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-bold text-slate-900">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-extrabold uppercase text-xs">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Taxes & Packaging (5%)</span>
              <span className="font-bold text-slate-900">₹{tax}</span>
            </div>

            {deliveryFee > 0 && (
              <p className="text-[11px] text-purple-600 bg-purple-50 p-2 rounded-xl">
                💡 Add ₹{500 - subtotal} more for <b>FREE Delivery</b>!
              </p>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-base sm:text-lg text-slate-900">
              <span>To Pay</span>
              <span className="text-purple-700">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-[1.01] transition transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>100% Safe & Secure Checkout</span>
          </div>
        </div>

      </div>
    </MobileLayout>
  );
};

export default Cart;
