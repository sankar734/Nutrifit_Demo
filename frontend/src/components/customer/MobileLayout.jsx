import React from 'react';
import BottomNav from './BottomNav';
import Navbar from './Navbar';
import Footer from './Footer';
import DeviceViewSwitcher from './DeviceViewSwitcher';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { Battery, Wifi, Signal } from 'lucide-react';

const MobileLayout = ({ children, showNav = true, fullWidth = false }) => {
  const { isMobileView, isSimulatorMode } = useDeviceMode();

  // 1. MOBILE VIEW (EITHER DESKTOP SIMULATOR PREVIEW OR NATIVE FULL-SCREEN MOBILE)
  if (isMobileView) {
    if (isSimulatorMode) {
      return (
        <div className="mobile-simulator-wrapper">
          {/* Device Switcher Banner Top */}
          <div className="mb-3 flex items-center justify-between w-full max-w-[430px] px-2 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Mobile Phone Preview</span>
            </div>
            <DeviceViewSwitcher inline={true} />
          </div>

          {/* Realistic Mobile Frame */}
          <div className="mobile-phone-frame relative">
            {/* Status Bar */}
            <div className="bg-white/80 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-slate-800 z-50 select-none">
              <span>9:41</span>
              <div className="mobile-notch -mt-3 shadow-inner" />
              <div className="flex items-center gap-1.5 text-slate-700">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={14} />
              </div>
            </div>

            {/* Phone Screen Scrollable Content */}
            <div className={`flex-1 overflow-y-auto bg-white ${showNav ? 'pb-24' : 'pb-6'}`}>
              {children}
            </div>

            {/* Bottom App Navigation */}
            {showNav && <BottomNav />}
          </div>

          <DeviceViewSwitcher />
        </div>
      );
    }

    // 2. NATIVE FULL-SCREEN MOBILE (for actual mobile phones & mobile screens)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col w-full max-w-full overflow-x-hidden relative">
        {/* Main Content Area */}
        <main className={`flex-1 w-full ${showNav ? 'pb-24' : 'pb-6'}`}>
          {children}
        </main>

        {/* Native Mobile Bottom Navigation */}
        {showNav && <BottomNav />}

        {/* Floating Device Switcher Button */}
        <DeviceViewSwitcher />
      </div>
    );
  }

  // 3. FULL DESKTOP WEB BROWSER VIEW (DEFAULT)
  return (
    <div className="web-layout-container relative">
      {/* Desktop Header Navbar */}
      <Navbar />

      {/* Main Responsive Web Content */}
      <main className="flex-1 w-full">
        {fullWidth ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        )}
      </main>

      {/* Desktop Web Footer */}
      <Footer />

      {/* Floating Device Toggle Button */}
      <DeviceViewSwitcher />
    </div>
  );
};

export default MobileLayout;
