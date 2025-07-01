'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // For mobile menu
import { Sun, Moon, Menu, Search, Users, LayoutGrid, MessageSquarePlus } from 'lucide-react';
import { useState, useEffect } from 'react';
// import { useTheme } from 'next-themes'; // Assuming next-themes for theme toggling

// Placeholder for i18n function
const i18n = (key: string) => key;

// Placeholder for useTheme hook if not using next-themes
const useTheme = () => {
  const [theme, setThemeState] = useState('light'); // Default theme
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
      setThemeState(localTheme);
      document.documentElement.classList.toggle('dark', localTheme === 'dark');
    }
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  return { theme, setTheme, mounted };
};


export function Header() {
  const { theme, setTheme, mounted } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    // Avoid rendering theme toggle until client is mounted to prevent hydration mismatch
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                {/* Placeholder content or a loading state for the header */}
            </div>
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Mobile Menu Trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden mr-2">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">{i18n("Open menu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-4 mt-6">
              <Link href="/new" passHref legacyBehavior><Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}><MessageSquarePlus className="mr-2 h-4 w-4" />{i18n("New Memo")}</Button></Link>
              <Link href="/users" passHref legacyBehavior><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}><Users className="mr-2 h-4 w-4" />{i18n("User List")}</Button></Link>
              <Link href="/view-toggle" passHref legacyBehavior><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}><LayoutGrid className="mr-2 h-4 w-4" />{i18n("Toggle View")}</Button></Link>
              {/* Add more mobile links here */}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo / Site Name */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* <YourLogoComponent /> */}
          <span className="font-bold sm:inline-block">{i18n("MemoBBS")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
            <Link href="/new" passHref legacyBehavior>
                <Button variant="outline" size="sm"><MessageSquarePlus className="mr-1 h-4 w-4" />{i18n("New")}</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => alert(i18n("Toggle User List"))}>
                <Users className="mr-1 h-4 w-4" />{i18n("Users")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => alert(i18n("Toggle View"))}>
                <LayoutGrid className="mr-1 h-4 w-4" />{i18n("View")}
            </Button>
          {/* Add more desktop links here */}
        </nav>

        {/* Search and Theme Toggle */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Input
              type="search"
              placeholder={i18n("Search memos...")}
              className="pl-10 h-9"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={i18n("Toggle theme")}>
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
