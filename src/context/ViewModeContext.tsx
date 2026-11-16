import React, { createContext, useContext, useEffect } from 'react';

interface ViewModeContextType {
  screenVersion: 'auto';
  screenScale: 'normal';
}

const ViewModeContext = createContext<ViewModeContextType>({
  screenVersion: 'auto',
  screenScale: 'normal',
});

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      localStorage.removeItem('cinebox_screen_version');
      localStorage.removeItem('cinebox_screen_scale');
      const root = document.documentElement;
      root.style.fontSize = '';
      root.classList.remove('scale-large', 'scale-small');
    } catch {}
  }, []);

  return (
    <ViewModeContext.Provider value={{ screenVersion: 'auto', screenScale: 'normal' }}>
      <div className="w-full min-h-screen">
        {children}
      </div>
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => useContext(ViewModeContext);
