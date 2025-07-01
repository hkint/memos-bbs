'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sun, Moon, Menu, Search, Users, LayoutGrid, MessageSquarePlus, Home, Shuffle, Globe, Rss as FeedIcon } from 'lucide-react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from 'next/navigation';

const i18n = (key: string) => key;

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');

  useEffect(() => setMounted(true), []);

  const navigateWithQuery = (pathname: string, queryParams?: Record<string, string | null>) => {
    const currentQuery = new URLSearchParams(searchParams?.toString());

    // Clear all specific view/section params if not explicitly set in new queryParams
    currentQuery.delete('view');
    currentQuery.delete('userId');
    currentQuery.delete('section');
    // currentQuery.delete('q'); // Keep search for now unless explicitly cleared

    if (queryParams) {
      for (const key in queryParams) {
        const value = queryParams[key];
        if (value !== null && value !== undefined && value !== '') {
          currentQuery.set(key, value);
        } else {
          currentQuery.delete(key); // Explicitly remove if value is null/undefined
        }
      }
    }
    router.push(`${pathname}?${currentQuery.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // When searching, clear section/view to go back to memo list
    navigateWithQuery('/', { q: searchQuery.trim() || null, section: null, view: null, userId: null });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    setSearchQuery(searchParams?.get('q') || '');
  }, [searchParams]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleLayoutModeToggle = () => { // Renamed from handleViewToggle for clarity
    const currentLayoutMode = searchParams?.get('layoutMode') || 'list'; // list or grid
    navigateWithQuery('/', { layoutMode: currentLayoutMode === 'list' ? 'grid' : 'list', section: searchParams?.get('section') }); // Preserve section
  };

  const handleUserListToggle = () => {
    alert(i18n("User list feature coming soon!"));
    setIsMobileMenuOpen(false);
  };

  const handleGoHome = () => navigateWithQuery('/', { section: null, view: null, userId: null, q: null });
  const handleGoBBS = () => navigateWithQuery('/', { section: null, view: 'bbs', userId: null });
  const handleRandomUser = () => navigateWithQuery('/', { section: null, view: 'random-user', userId: null });
  const handleShowFeeds = () => navigateWithQuery('/', { section: 'feeds', view: null, userId: null });

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center"></div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden mr-2">
            <Button variant="ghost" size="icon" title={i18n("Open menu")}>
              <Menu className="h-6 w-6" /><span className="sr-only">{i18n("Open menu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="flex flex-col space-y-1 mt-6">
              <Button variant="ghost" className="w-full justify-start" onClick={handleGoHome}><Home className="mr-2 h-4 w-4" />{i18n("Memos Home")}</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleGoBBS}><Globe className="mr-2 h-4 w-4" />{i18n("Public Square")}</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleRandomUser}><Shuffle className="mr-2 h-4 w-4" />{i18n("Random User")}</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleShowFeeds}><FeedIcon className="mr-2 h-4 w-4" />{i18n("Blog Feeds")}</Button>
              <hr className="my-2"/>
              <Link href="/new" passHref legacyBehavior><Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}><MessageSquarePlus className="mr-2 h-4 w-4" />{i18n("New Memo")}</Button></Link>
              <Button variant="ghost" className="w-full justify-start" onClick={handleUserListToggle}><Users className="mr-2 h-4 w-4" />{i18n("User List")}</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLayoutModeToggle}><LayoutGrid className="mr-2 h-4 w-4" />{i18n("Toggle Grid/List Layout")}</Button>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2" onClick={handleGoHome}>
          <span className="font-bold sm:inline-block">{i18n("MemoBBS")}</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleGoHome} title={i18n("Memos Home")}><Home className="mr-1 h-4 w-4" />{i18n("Home")}</Button>
          <Button variant="ghost" size="sm" onClick={handleGoBBS} title={i18n("Public Square (BBS)")}><Globe className="mr-1 h-4 w-4" />{i18n("Square")}</Button>
          <Button variant="ghost" size="sm" onClick={handleRandomUser} title={i18n("Random User")}><Shuffle className="mr-1 h-4 w-4" />{i18n("Random")}</Button>
          <Button variant="ghost" size="sm" onClick={handleShowFeeds} title={i18n("Blog Feeds")}><FeedIcon className="mr-1 h-4 w-4" />{i18n("Feeds")}</Button>
          <div className="border-l h-6 mx-2"></div>
          <Link href="/new" passHref legacyBehavior><Button variant="outline" size="sm"><MessageSquarePlus className="mr-1 h-4 w-4" />{i18n("New")}</Button></Link>
          <Button variant="ghost" size="sm" onClick={handleUserListToggle} title={i18n("User List")}><Users className="mr-1 h-4 w-4" />{i18n("Users")}</Button>
          <Button variant="ghost" size="sm" onClick={handleLayoutModeToggle} title={i18n("Toggle Grid/List Layout")}><LayoutGrid className="mr-1 h-4 w-4" />{i18n("Layout")}</Button>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Input type="search" placeholder={i18n("Search memos...")} className="pl-10 h-9" value={searchQuery} onChange={handleSearchChange} />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </form>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={i18n("Toggle theme")}>
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
