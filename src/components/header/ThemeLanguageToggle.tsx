import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";

interface ThemeLanguageToggleProps {
  showOnlyTheme?: boolean;
  showOnlyLanguage?: boolean;
}

const ThemeLanguageToggle = ({ showOnlyTheme, showOnlyLanguage }: ThemeLanguageToggleProps) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useSettings();

  return (
    <div className="flex items-center gap-0 sm:gap-1">
      {/* Theme Toggle */}
      {!showOnlyLanguage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 p-0 text-foreground hover:text-muted-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      )}

      {/* Language Toggle Button */}
      {!showOnlyTheme && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
          className="h-8 px-2 sm:px-3 text-foreground hover:text-muted-foreground text-xs font-medium whitespace-nowrap"
        >
          <span className="hidden sm:inline">{language === "en" ? "বাংলা" : "English"}</span>
          <span className="sm:hidden">{language === "en" ? "বা" : "EN"}</span>
        </Button>
      )}
    </div>
  );
};

export default ThemeLanguageToggle;
