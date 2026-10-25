import React, { useState } from 'react';
import { AlertTriangle, Wallet, X, CheckCircle2, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { orderApi } from '../../services/api';

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Delivery time is taking longer than expected',
  'Need to change delivery address or meal',
  'Change of mind / Dietary preference change',
  'Other reasons',
];

const CancelOrderModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !order) return null;

  const isPreCooking = ['placed', 'accepted'].includes(order.status);
  const isCooking = ['preparing', 'ready'].includes(order.status);
  const refundPercent = isPreCooking ? 100 : 50;
  const refundAmount = isPreCooking 
    ? (order.totalAmount || 0) 
    : Math.round((order.totalAmount || 0) * 0.5);
  const deductionAmount = (order.totalAmount || 0) - refundAmount;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    const finalReason = selectedReason === 'Other reasons' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    try {
      const { data } = await orderApi.cancel(order._id, { reason: finalReason });
      if (onSuccess) {
        onSuccess(data.data.order, data.message || `Order cancelled. ₹${data.data.refundAmount} refunded to wallet.`);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || 'Could not cancel order at this moment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isPreCooking ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Cancel Order #{order.orderNumber}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Review refund breakdown before confirming
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Refund Tier Policy Notice */}
          {isPreCooking ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wide">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>100% Full Refund Guaranteed</span>
                </span>
                <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Before Cooking
                </span>
              </div>
              <p className="text-xs text-emerald-950/80 leading-relaxed font-medium">
                Great news! The home kitchen hasn't started cooking yet. The entire order amount of <strong className="font-black text-emerald-900">₹{order.totalAmount}</strong> will be refunded to your <strong className="font-black text-emerald-900">NutriChef Wallet</strong> instantly.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wide">
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span>50% Refund Policy (Meal in Prep)</span>
                </span>
                <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                  Half Refund
                </span>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed font-medium">
                The chef is currently preparing your meal with fresh organic ingredients! As per NutriChef's fair kitchen policy:
              </p>
              <ul className="text-xs text-amber-900 font-semibold space-y-1 list-disc list-inside pt-1">
                <li><strong className="text-slate-900 font-black">₹{refundAmount} (50%)</strong> will be refunded to your Wallet</li>
                <li><strong className="text-slate-900 font-black">₹{deductionAmount} (50%)</strong> is retained to compensate the chef for ingredient & preparation costs</li>
              </ul>
            </div>
          )}

          {/* Refund Summary Breakdown Table */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Wallet size={14} className="text-purple-600" />
              <span>Wallet Refund Calculation</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Order Total Amount:</span>
                <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refund Percentage:</span>
                <span className={`font-black ${isPreCooking ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {refundPercent}%
                </span>
              </div>
              {!isPreCooking && (
                <div className="flex justify-between text-rose-600">
                  <span>Kitchen Prep Deduction (50%):</span>
                  <span className="font-bold">-₹{deductionAmount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Instant Wallet Credit:</span>
                <span className="text-purple-700">₹{refundAmount}</span>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-medium cursor-pointer transition ${
                    selectedReason === reason
                      ? 'border-purple-600 bg-purple-50/60 text-purple-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-purple-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other reasons' && (
              <div className="pt-1">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify your reason for cancelling..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Keep Order
          </button>

          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/25 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <span>Cancel & Refund ₹{refundAmount}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
