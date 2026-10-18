import { useState } from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import Header from '../../../components/customer/Header';
import MobileLayout from '../../../components/customer/MobileLayout';

const options = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System Default', icon: Smartphone },
];

const Appearance = () => {
  const [mode, setMode] = useState('light');

  return (
    <MobileLayout showNav={false}>
      <Header title="Appearance" showBack />
      <div className="px-5">
        <div className="flex flex-col gap-2">
          {options.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border text-sm font-medium transition ${
                mode === key ? 'border-primary bg-lavender text-primary' : 'border-lavender bg-white text-ink'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-4 px-1">
          Dark mode theming is a roadmap item — this screen demonstrates the selection UI ahead of full theme support.
        </p>
      </div>
    </MobileLayout>
  );
};

export default Appearance;
