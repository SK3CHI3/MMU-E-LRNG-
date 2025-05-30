import { useNavigate } from 'react-router-dom';

/**
 * Utility function to navigate to messaging page with a specific user
 * @param userId - The ID of the user to message
 * @param navigate - React Router navigate function
 */
export const navigateToMessage = (userId: string, navigate: (path: string) => void) => {
  navigate(`/messages?user=${userId}`);
};

/**
 * Hook to get messaging navigation function
 */
export const useMessageNavigation = () => {
  const navigate = useNavigate();
  
  return (userId: string) => {
    navigateToMessage(userId, navigate);
  };
};

/**
 * Generate messaging URL with user parameter
 * @param userId - The ID of the user to message
 * @returns URL string for messaging page
 */
export const getMessageUrl = (userId: string): string => {
  return `/messages?user=${userId}`;
};
