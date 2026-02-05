import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthPrompt = () => {
  const { user } = useAuth();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptAction, setPromptAction] = useState<string>('');

  const requireAuth = useCallback((action: string, callback?: () => void) => {
    if (!user) {
      setPromptAction(action);
      setIsPromptOpen(true);
      return false;
    }
    if (callback) {
      callback();
    }
    return true;
  }, [user]);

  const closePrompt = useCallback(() => {
    setIsPromptOpen(false);
    setPromptAction('');
  }, []);

  return {
    isAuthenticated: !!user,
    isPromptOpen,
    promptAction,
    requireAuth,
    closePrompt,
  };
};
