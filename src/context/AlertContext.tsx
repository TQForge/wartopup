import React, { createContext, useContext, useCallback } from 'react';

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showAlert = useCallback((_message: string, _type: 'success' | 'error' | 'info' = 'info') => {
    // Popup alert removed as per user request
    console.log(`Alert: ${_message} (${_type})`);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
