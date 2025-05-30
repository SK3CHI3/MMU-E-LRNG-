/**
 * Handles scroll animations for elements with the 'reveal' class
 * Elements will animate in when they come into view during scrolling
 */

export const initScrollAnimations = () => {
  // Function to check if an element is in viewport
  const isInViewport = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
      rect.bottom >= 0
    );
  };

  // Function to handle scroll events
  const handleScroll = () => {
    const revealElements = document.querySelectorAll('.reveal');
    
    revealElements.forEach((element) => {
      if (isInViewport(element)) {
        element.classList.add('active');
      }
    });
  };

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  // Trigger once on load to reveal elements already in viewport
  handleScroll();

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};
