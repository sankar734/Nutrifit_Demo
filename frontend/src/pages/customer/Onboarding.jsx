import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  { emoji: '👩‍🍳', title: 'Verified Home Chefs', desc: 'Fresh, homemade meals cooked with love by verified local chefs near you.' },
  { emoji: '🥗', title: 'AI-Powered Nutrition', desc: 'Get personalized meal recommendations based on your health goals.' },
  { emoji: '🚴', title: 'Live Order Tracking', desc: 'Track your meal from the kitchen to your doorstep in real time.' },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = slides[step];

  const next = () => {
    if (step === slides.length - 1) navigate('/login');
    else setStep(step + 1);
  };

  return (
    <div className="app-shell flex flex-col justify-between bg-lavender-gradient px-6 py-10">
      <button onClick={() => navigate('/login')} className="self-end text-sm text-muted font-medium">
        Skip
      </button>

      <div className="flex flex-col items-center text-center animate-fade-up" key={step}>
        <div className="w-32 h-32 rounded-full bg-white shadow-soft flex items-center justify-center text-6xl mb-8">
          {slide.emoji}
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">{slide.title}</h2>
        <p className="text-sm text-muted max-w-xs">{slide.desc}</p>
      </div>

      <div>
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-primary/30'}`} />
          ))}
        </div>
        <button
          onClick={next}
          className="w-full py-3.5 rounded-pill bg-primary-gradient text-white font-semibold shadow-soft active:scale-[0.98] transition"
        >
          {step === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
