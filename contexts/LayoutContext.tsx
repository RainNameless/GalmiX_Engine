import React, { createContext, useState, ReactNode } from 'react';

type LayoutType = 'vertical' | 'horizontal';

interface LayoutContextType {
  currentLayout: LayoutType;
  setCurrentLayout: (layout: LayoutType) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  currentLayout: 'vertical',
  setCurrentLayout: () => {},
});

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('vertical');

  return (
    <LayoutContext.Provider value={{ currentLayout, setCurrentLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

