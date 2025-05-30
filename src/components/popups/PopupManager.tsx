import React, { createContext, useContext, useState, ReactNode } from 'react';
import HelpCenterPopup from './HelpCenterPopup';
import FAQsPopup from './FAQsPopup';
import StudentGuidePopup from './StudentGuidePopup';
import PrivacyPolicyPopup from './PrivacyPolicyPopup';
import TermsOfUsePopup from './TermsOfUsePopup';

export type PopupType = 'help-center' | 'faqs' | 'student-guide' | 'privacy-policy' | 'terms-of-use';

interface PopupContextType {
  openPopup: (type: PopupType) => void;
  closePopup: () => void;
  currentPopup: PopupType | null;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [currentPopup, setCurrentPopup] = useState<PopupType | null>(null);

  const openPopup = (type: PopupType) => {
    setCurrentPopup(type);
  };

  const closePopup = () => {
    setCurrentPopup(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closePopup();
    }
  };

  return (
    <PopupContext.Provider value={{ openPopup, closePopup, currentPopup }}>
      {children}
      
      {/* Render all popups */}
      <HelpCenterPopup 
        open={currentPopup === 'help-center'} 
        onOpenChange={handleOpenChange} 
      />
      <FAQsPopup 
        open={currentPopup === 'faqs'} 
        onOpenChange={handleOpenChange} 
      />
      <StudentGuidePopup 
        open={currentPopup === 'student-guide'} 
        onOpenChange={handleOpenChange} 
      />
      <PrivacyPolicyPopup 
        open={currentPopup === 'privacy-policy'} 
        onOpenChange={handleOpenChange} 
      />
      <TermsOfUsePopup 
        open={currentPopup === 'terms-of-use'} 
        onOpenChange={handleOpenChange} 
      />
    </PopupContext.Provider>
  );
};

// Convenience hook for opening specific popups
export const usePopupActions = () => {
  const { openPopup } = usePopup();
  
  return {
    openHelpCenter: () => openPopup('help-center'),
    openFAQs: () => openPopup('faqs'),
    openStudentGuide: () => openPopup('student-guide'),
    openPrivacyPolicy: () => openPopup('privacy-policy'),
    openTermsOfUse: () => openPopup('terms-of-use'),
  };
};
