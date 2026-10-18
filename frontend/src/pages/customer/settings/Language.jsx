import { Check } from 'lucide-react';
import Header from '../../../components/customer/Header';
import MobileLayout from '../../../components/customer/MobileLayout';
import { useLanguage } from '../../../context/LanguageContext';

const Language = () => {
  const { language, setLanguage, languageMeta } = useLanguage();

  return (
    <MobileLayout showNav={false}>
      <Header title="Language" showBack />
      <div className="px-5">
        <div className="bg-white rounded-card shadow-glass border border-lavender/60 divide-y divide-lavender">
          {languageMeta.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className="w-full flex items-center justify-between px-4 py-3.5"
            >
              <span className="text-sm text-ink">{l.label}</span>
              {language === l.code && <Check size={16} className="text-primary" />}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-4 px-1">
          Applies instantly across navigation, home, cart, checkout and profile screens. More languages and full
          screen coverage are on the roadmap.
        </p>
      </div>
    </MobileLayout>
  );
};

export default Language;
