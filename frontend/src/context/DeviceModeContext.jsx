import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const DeviceModeContext = createContext(null);

export const DeviceModeProvider = ({ children }) => {
  // 1. Detect if current viewport is a mobile screen width (< 768px)
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  // 2. Track user's explicit preference on desktop ('desktop' | 'mobile')
  const [desktopPreference, setDesktopPreference] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    return localStorage.getItem('nutrichef_desktop_mode') || 'desktop';
  });

  // 3. Mobile screen override (if user on mobile explicitly requests desktop site)
  const [mobileOverride, setMobileOverride] = useState(null);

  // 4. Computed isMobileView:
  // - On mobile device/screen (< 768px): AUTOMATICALLY true (mobile view) unless overridden
  // - On desktop screen (>= 768px): follows desktopPreference ('mobile' for simulator, 'desktop' for full web)
  const isMobileView = isMobileScreen
    ? (mobileOverride === 'desktop' ? false : true)
    : (desktopPreference === 'mobile');

  // Simulator mode is active ONLY on desktop screens when Phone preview is selected
  const isSimulatorMode = isMobileView && !isMobileScreen;

  // 5. Automatic detection on window resize and media query change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleViewportChange = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
      // Clear mobile override when resizing across breakpoints
      setMobileOverride(null);
    };

    window.addEventListener('resize', handleViewportChange);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleViewportChange);
    }

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleViewportChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleViewportChange);
      }
    };
  }, []);

  // 6. Explicitly set view mode ('desktop' or 'mobile')
  const setViewMode = useCallback((mode) => {
    if (isMobileScreen) {
      setMobileOverride(mode);
    } else {
      setDesktopPreference(mode);
      try {
        localStorage.setItem('nutrichef_desktop_mode', mode);
        localStorage.setItem('nutrichef_view_mode', mode);
      } catch (e) {}
    }
  }, [isMobileScreen]);

  const toggleViewMode = useCallback(() => {
    setViewMode(isMobileView ? 'desktop' : 'mobile');
  }, [isMobileView, setViewMode]);

  return (
    <DeviceModeContext.Provider
      value={{
        isMobileView,
        isMobileScreen,
        isSimulatorMode,
        viewMode: isMobileView ? 'mobile' : 'desktop',
        desktopPreference,
        setViewMode,
        toggleViewMode,
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  );
};

export const useDeviceMode = () => {
  const context = useContext(DeviceModeContext);
  if (!context) {
    return {
      isMobileView: false,
      isMobileScreen: false,
      isSimulatorMode: false,
      viewMode: 'desktop',
      desktopPreference: 'desktop',
      toggleViewMode: () => {},
      setViewMode: () => {},
    };
  }
  return context;
};

