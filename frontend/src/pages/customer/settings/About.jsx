import Header from '../../../components/customer/Header';
import MobileLayout from '../../../components/customer/MobileLayout';

const About = () => (
  <MobileLayout showNav={false}>
    <Header title="About NutriChef" showBack />
    <div className="px-5 flex flex-col items-center text-center gap-3 pb-8">
      <div className="w-16 h-16 rounded-3xl bg-primary-gradient flex items-center justify-center text-2xl shadow-soft mt-4">
        🥑
      </div>
      <h2 className="text-lg font-bold text-ink">NutriChef</h2>
      <p className="text-xs text-muted">Version 1.0.0</p>
      <p className="text-sm text-muted max-w-xs">
        NutriChef connects you with verified home chefs cooking healthy, homemade meals — personalized with AI-powered
        nutrition guidance, delivered fresh to your door.
      </p>
      <div className="w-full bg-white rounded-card shadow-glass border border-lavender/60 p-4 mt-4 text-left">
        <p className="text-xs text-muted leading-relaxed">
          Built with React, Node.js, MongoDB and Socket.IO. AI features powered by Google Gemini / OpenAI. Payments
          secured by Razorpay.
        </p>
      </div>
    </div>
  </MobileLayout>
);

export default About;
