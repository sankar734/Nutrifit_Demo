import { useNavigate } from 'react-router-dom';
import { Bell, CreditCard, HelpCircle, Info, Shield, ChevronRight, Globe, Moon } from 'lucide-react';
import MobileLayout from '../../../components/customer/MobileLayout';
import Header from '../../../components/customer/Header';

const settingsGroups = [
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notification Preferences', path: '/settings/notifications' },
      { icon: Globe, label: 'Language', path: '/settings/language' },
      { icon: Moon, label: 'Dark Mode', path: '/settings/appearance' },
    ],
  },
  {
    title: 'Account',
    items: [{ icon: CreditCard, label: 'Payment Methods', path: '/settings/payments' }],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', path: '/settings/help' },
      { icon: Shield, label: 'Privacy Policy', path: '/settings/privacy' },
      { icon: Info, label: 'About NutriChef', path: '/settings/about' },
    ],
  },
];

const Settings = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout showNav={false}>
      <Header title="Settings" showBack />
      <div className="px-5 flex flex-col gap-5 pb-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-1">{group.title}</p>
            <div className="bg-white rounded-card shadow-glass border border-lavender/60 divide-y divide-lavender">
              {group.items.map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-primary" />
                    <span className="text-sm text-ink">{label}</span>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default Settings;
