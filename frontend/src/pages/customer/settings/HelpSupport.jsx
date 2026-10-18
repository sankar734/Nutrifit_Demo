import { useState } from 'react';
import { Mail, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import Header from '../../../components/customer/Header';
import MobileLayout from '../../../components/customer/MobileLayout';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to My Orders from your Profile, tap any order, and you\'ll see a live status stepper from placed to delivered.' },
  { q: 'What payment methods are supported?', a: 'UPI, credit/debit cards and net banking via Razorpay, plus NutriChef Wallet and Cash on Delivery.' },
  { q: 'How do I become a chef or delivery partner?', a: 'Open your Profile and tap "Become a Chef" or "Become a Delivery Partner" to submit an application.' },
  { q: 'How do refunds work?', a: 'Refunds for cancelled or rejected orders are credited back to your original payment method or wallet within 3-5 business days.' },
];

const HelpSupport = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <MobileLayout showNav={false}>
      <Header title="Help & Support" showBack />
      <div className="px-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <a href="mailto:support@nutrichef.demo" className="flex flex-col items-center gap-1.5 bg-white rounded-2xl shadow-glass border border-lavender/60 py-4">
            <Mail size={18} className="text-primary" />
            <span className="text-[11px] font-medium text-ink">Email Us</span>
          </a>
          <a href="tel:+911800123456" className="flex flex-col items-center gap-1.5 bg-white rounded-2xl shadow-glass border border-lavender/60 py-4">
            <Phone size={18} className="text-primary" />
            <span className="text-[11px] font-medium text-ink">Call Us</span>
          </a>
          <button className="flex flex-col items-center gap-1.5 bg-white rounded-2xl shadow-glass border border-lavender/60 py-4">
            <MessageCircle size={18} className="text-primary" />
            <span className="text-[11px] font-medium text-ink">Live Chat</span>
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink mb-2 px-1">Frequently Asked Questions</p>
          <div className="bg-white rounded-card shadow-glass border border-lavender/60 divide-y divide-lavender">
            {faqs.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-medium text-ink pr-3">{f.q}</span>
                  <ChevronDown size={16} className={`text-muted shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && <p className="text-xs text-muted px-4 pb-3.5">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default HelpSupport;
