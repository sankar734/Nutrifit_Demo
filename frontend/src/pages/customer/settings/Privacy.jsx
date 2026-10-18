import Header from '../../../components/customer/Header';
import MobileLayout from '../../../components/customer/MobileLayout';

const sections = [
  { title: 'Information We Collect', body: 'Name, contact details, delivery addresses, order history, and health profile information you choose to share for personalized nutrition recommendations.' },
  { title: 'How We Use Your Data', body: 'To process orders, personalize meal recommendations, send order and account notifications, and improve our services.' },
  { title: 'Data Sharing', body: 'We share only what\'s necessary with chefs and delivery partners to fulfill your order (name, address, phone). We never sell your personal data.' },
  { title: 'Payment Security', body: 'Payments are processed securely through Razorpay. NutriChef does not store your card details.' },
  { title: 'Your Rights', body: 'You can update or delete your health profile, addresses, and account at any time from your Profile.' },
];

const Privacy = () => (
  <MobileLayout showNav={false}>
    <Header title="Privacy Policy" showBack />
    <div className="px-5 flex flex-col gap-4 pb-8">
      <p className="text-xs text-muted">Last updated: January 2026</p>
      {sections.map((s) => (
        <div key={s.title} className="bg-white rounded-card shadow-glass border border-lavender/60 p-4">
          <p className="text-sm font-semibold text-ink mb-1">{s.title}</p>
          <p className="text-xs text-muted leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  </MobileLayout>
);

export default Privacy;
