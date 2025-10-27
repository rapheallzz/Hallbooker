'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isHallModalOpen: boolean;
  openHallModal: () => void;
  closeHallModal: () => void;
  isStaffModalOpen: boolean;
  openStaffModal: () => void;
  closeStaffModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const openHallModal = () => setIsHallModalOpen(true);
  const closeHallModal = () => setIsHallModalOpen(false);

  const openStaffModal = () => setIsStaffModalOpen(true);
  const closeStaffModal = () => setIsStaffModalOpen(false);

  return (
    <UIContext.Provider
      value={{
        isHallModalOpen,
        openHallModal,
        closeHallModal,
        isStaffModalOpen,
        openStaffModal,
        closeStaffModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
