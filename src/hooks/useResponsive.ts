import { useState, useEffect } from 'react';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Helper functions for responsive grid columns
  const getGymGridColumns = () => {
    if (windowWidth < 480) return 'repeat(3, 1fr)';
    if (windowWidth < 640) return 'repeat(4, 1fr)';
    if (windowWidth < 768) return 'repeat(6, 1fr)';
    if (windowWidth < 1024) return 'repeat(8, 1fr)';
    return 'repeat(16, 1fr)';
  };

  const getStatGridColumns = () => {
    if (windowWidth < 480) return 'repeat(1, 1fr)';
    if (windowWidth < 640) return 'repeat(2, 1fr)';
    return 'repeat(4, 1fr)';
  };

  const getPerksGridColumns = () => {
    if (windowWidth < 480) return 'repeat(1, 1fr)';
    if (windowWidth < 640) return 'repeat(2, 1fr)';
    if (windowWidth < 1024) return 'repeat(3, 1fr)';
    return 'repeat(5, 1fr)';
  };

  const getSettingsGridColumns = () => {
    if (windowWidth < 640) return 'repeat(1, 1fr)';
    if (windowWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(3, 1fr)';
  };

  // Mobile-specific helper functions
  const isMobile = () => windowWidth < 640;
  const isTablet = () => windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = () => windowWidth >= 1024;

  const getMobilePadding = () => {
    if (windowWidth < 480) return '8px';
    if (windowWidth < 640) return '12px';
    return '16px';
  };

  const getMobileFontSize = () => {
    if (windowWidth < 480) return {
      small: '10px',
      normal: '12px',
      large: '14px',
      xlarge: '16px'
    };
    return {
      small: '11px',
      normal: '13px',
      large: '15px',
      xlarge: '18px'
    };
  };

  return {
    screenSize,
    windowWidth,
    getGymGridColumns,
    getStatGridColumns,
    getPerksGridColumns,
    getSettingsGridColumns,
    isMobile,
    isTablet,
    isDesktop,
    getMobilePadding,
    getMobileFontSize
  };
}
