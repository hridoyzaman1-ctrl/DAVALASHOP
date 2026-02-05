import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { LogIn, UserPlus } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

const AuthPromptModal = ({ isOpen, onClose, action }: AuthPromptModalProps) => {
  const navigate = useNavigate();
  const { language } = useSettings();

  const handleLogin = () => {
    onClose();
    navigate("/auth?mode=login");
  };

  const handleSignUp = () => {
    onClose();
    navigate("/auth?mode=signup");
  };

  const actionText = action || (language === 'bn' ? 'এই ফিচার ব্যবহার করতে' : 'use this feature');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light">
            {language === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {language === 'bn' 
              ? `${actionText} আপনাকে প্রথমে লগইন বা সাইন আপ করতে হবে।`
              : `Please sign in or create an account to ${actionText}.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleLogin} 
            className="w-full rounded-none h-12"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
          </Button>
          
          <Button 
            onClick={handleSignUp} 
            variant="outline" 
            className="w-full rounded-none h-12"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
          </Button>
          
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="w-full rounded-none text-muted-foreground"
          >
            {language === 'bn' ? 'পরে করব' : 'Maybe Later'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptModal;
