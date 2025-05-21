import { useEffect, useState } from 'react';

/**
 * Hook to detect if the current device is a mobile device
 * @param breakpoint The breakpoint to use for mobile detection (default: 768px)
 * @returns A boolean indicating if the current device is a mobile device
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (to avoid SSR issues)
    if (typeof window === 'undefined') {
      return;
    }

    // Function to check if the screen width is less than the breakpoint
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
