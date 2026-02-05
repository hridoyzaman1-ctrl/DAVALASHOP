import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const phoneSchema = z.string().min(11, "Phone number must be at least 11 digits").regex(/^0\d{10}$/, "Enter a valid Bangladesh phone number (e.g., 01712345678)");

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? false : true;

  const [isLogin, setIsLogin] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string }>({});

  const [showVerification, setShowVerification] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { language } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Update mode when URL params change
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'signup');
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; phone?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    // Validate phone only during signup
    if (!isLogin) {
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) {
        newErrors.phone = phoneResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, phone);

      if (error) {
        let message = error.message;
        if (error.message.includes("User already registered")) {
          message = language === 'bn'
            ? "এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।"
            : "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes("Invalid login credentials")) {
          message = language === 'bn'
            ? "ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করুন।"
            : "Invalid email or password. Please try again.";
        } else if (error.message.includes("phone number is already registered")) {
          message = language === 'bn'
            ? "এই ফোন নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে।"
            : "This phone number is already registered to another account.";
        }

        toast({
          title: language === 'bn' ? "ত্রুটি" : "Error",
          description: message,
          variant: "destructive",
        });
      } else {
        if (!isLogin) {
          // Signup successful - show verification message
          setShowVerification(true);
          toast({
            title: language === 'bn' ? "অ্যাকাউন্ট তৈরি হয়েছে!" : "Account created!",
            description: language === 'bn'
              ? "দয়া করে আপনার ইমেইল চেক করুন।"
              : "Please check your email for verification.",
          });
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn'
          ? "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-card p-8 rounded-lg shadow-sm border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-foreground mb-4">
            {language === 'bn' ? 'আপনার ইমেইল চেক করুন' : 'Check your email'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'bn'
              ? `আমরা ${email} ঠিকানায় একটি ভেরিফিকেশন লিঙ্ক পাঠিয়েছি। অনুগ্রহ করে লিঙ্কটিতে ক্লিক করে আপনার অ্যাকাউন্ট নিশ্চিত করুন।`
              : `We sent a verification link to ${email}. Please click the link to confirm your account.`}
          </p>
          <Button
            onClick={() => {
              setShowVerification(false);
              setIsLogin(true);
            }}
            variant="outline"
            className="w-full"
          >
            {language === 'bn' ? 'লগইন-এ ফিরে যান' : 'Back to Login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">DAVALA</h1>
          <p className="text-muted-foreground">
            {isLogin
              ? (language === 'bn' ? 'আবারও স্বাগতম' : 'Welcome back')
              : (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create your account')}
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'bn' ? 'ইমেইল' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'bn' ? 'আপনার@ইমেইল.com' : 'your@email.com'}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Phone Number Field - Signup Only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'bn' ? '০১৭১২৩৪৫৬৭৮' : '01712345678'}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {language === 'bn'
                    ? 'প্রতিটি অ্যাকাউন্টে একটি অনন্য ফোন নম্বর প্রয়োজন'
                    : 'One unique phone number per account'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? (language === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...')
                : (isLogin
                  ? (language === 'bn' ? 'লগইন করুন' : 'Sign In')
                  : (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'))}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? (language === 'bn'
                  ? 'অ্যাকাউন্ট নেই? সাইন আপ করুন'
                  : "Don't have an account? Sign up")
                : (language === 'bn'
                  ? 'অ্যাকাউন্ট আছে? লগইন করুন'
                  : "Already have an account? Sign in")}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {language === 'bn' ? 'স্টোরে ফিরুন' : 'Back to store'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
