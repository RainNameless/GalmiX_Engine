import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"

interface EditorHeaderProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isMobile: boolean;
  onMenuToggle: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ 
  isAuthenticated, 
  onLogin,
  onLogout,
  isMobile,
  onMenuToggle,
}) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMenuExpanded && !(e.target as Element).closest('.header-menu')) {
        setIsMenuExpanded(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMenuExpanded]);

  const handleAction = (action: () => void) => {
    action();
    setIsMenuExpanded(false);
    if (isAuthenticated) {
      onMenuToggle(); // Retract left-side menu on logout
    }
  };

  if (isMobile) {
    return (
      <div className="fixed right-0 top-1/4 z-50 flex header-menu">
        <div 
          className="bg-black w-2 h-16 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuExpanded(!isMenuExpanded);
          }}
        />
        {isMenuExpanded && (
          <div className="fixed right-0 top-1/4 bg-white p-4 shadow-md">
            {isAuthenticated ? (
              <Button onClick={() => handleAction(onLogout)}>登出</Button>
            ) : (
              <Button onClick={() => handleAction(onLogin)}>登录</Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      {isAuthenticated ? (
        <Button onClick={onLogout}>登出</Button>
      ) : (
        <Button onClick={onLogin}>登录</Button>
      )}
    </div>
  );
};

