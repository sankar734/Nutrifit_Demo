import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useDeviceMode } from '../../context/DeviceModeContext';

const DeviceViewSwitcher = ({ inline = false }) => {
  const { isMobileView, isMobileScreen, setViewMode } = useDeviceMode();

  if (inline) {
    return (
      <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/90 shadow-xs">
        <button
          type="button"
          onClick={() => setViewMode('desktop')}
          title="Switch to Full Desktop View"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
            !isMobileView
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor size={14} className={!isMobileView ? 'text-purple-600' : 'text-slate-500'} />
          <span>Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('mobile')}
          title="Switch to Mobile Phone View"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
            isMobileView
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone size={14} className={isMobileView ? 'text-white' : 'text-slate-500'} />
          <span>Phone</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-fade-in group">
      <div className="flex items-center p-1 bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-700/80">
        <button
          type="button"
          onClick={() => setViewMode('desktop')}
          title="Switch to Full Desktop View"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
            !isMobileView
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor size={15} />
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('mobile')}
          title="Switch to Mobile Phone View"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
            isMobileView
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone size={15} />
          <span className="hidden sm:inline">Phone</span>
        </button>

        {isMobileScreen && (
          <span className="ml-1 mr-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 sm:hidden">
            Mobile Auto
          </span>
        )}
      </div>
    </div>
  );
};

export default DeviceViewSwitcher;

