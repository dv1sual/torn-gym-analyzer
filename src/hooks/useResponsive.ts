import { useState, useEffect } from 'react';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setScreenSize('mobile');
      } else if (width < 768) {
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
    if (screenSize === 'mobile') return 'repeat(4, 1fr)';
    if (screenSize === 'tablet') return 'repeat(8, 1fr)';
    return 'repeat(16, 1fr)';
  };

  const getStatGridColumns = () => {
    if (screenSize === 'mobile') return 'repeat(2, 1fr)';
    return 'repeat(4, 1fr)';
  };

  const getPerksGridColumns = () => {
    if (screenSize === 'mobile') return 'repeat(2, 1fr)';
    if (screenSize === 'tablet') return 'repeat(3, 1fr)';
    return 'repeat(5, 1fr)';
  };

  const getSettingsGridColumns = () => {
    if (screenSize === 'mobile') return 'repeat(1, 1fr)';
    return 'repeat(3, 1fr)';
  };

  return {
    screenSize,
    getGymGridColumns,
    getStatGridColumns,
    getPerksGridColumns,
    getSettingsGridColumns
  };
}
