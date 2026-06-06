'use client';

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore, type Page } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  GraduationCap,
  LogOut,
  Menu,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems: { page: Page; label: string; icon: ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { page: 'groups', label: 'Groups', icon: <Users className="h-5 w-5" /> },
  { page: 'payments', label: 'Payments', icon: <DollarSign className="h-5 w-5" /> },
  { page: 'teachers', label: 'Teachers', icon: <GraduationCap className="h-5 w-5" /> },
];

/** Floating decorative dots for the sidebar background */
function SidebarDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Floating dots */}
      <div className="sidebar-dot-1 absolute w-2 h-2 rounded-full bg-white/15" style={{ top: '15%', right: '18%' }} />
      <div className="sidebar-dot-2 absolute w-1.5 h-1.5 rounded-full bg-amber-400/20" style={{ top: '35%', left: '12%' }} />
      <div className="sidebar-dot-3 absolute w-2.5 h-2.5 rounded-full bg-white/10" style={{ top: '55%', right: '10%' }} />
      <div className="sidebar-dot-4 absolute w-1 h-1 rounded-full bg-amber-300/25" style={{ top: '72%', left: '22%' }} />
      <div className="sidebar-dot-5 absolute w-1.5 h-1.5 rounded-full bg-white/20" style={{ top: '88%', right: '25%' }} />

      {/* Floating lines */}
      <div className="sidebar-line-1 absolute w-8 h-px bg-white/10 rounded-full" style={{ top: '25%', left: '60%' }} />
      <div className="sidebar-line-2 absolute w-12 h-px bg-white/8 rounded-full" style={{ top: '65%', left: '30%' }} />
    </div>
  );
}

/** Gradient separator with gold accent */
function GradientSeparator() {
  return (
    <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

/** Admin profile gradient separator */
function AdminSeparator() {
  return (
    <div className="mx-4 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const currentPage = useAppStore((s) => s.currentPage);
  const admin = useAppStore((s) => s.admin);
  const setPage = useAppStore((s) => s.setPage);
  const logout = useAppStore((s) => s.logout);

  const handleNav = (page: Page) => {
    setPage(page);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Decorative background elements */}
      <SidebarDecorations />

      {/* Content layer - sits above decorations */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <div className="relative">
            <Image src="/brandmark.png" alt="AA" width={36} height={36} className="rounded-lg" />
            {/* Subtle glow behind logo */}
            <div className="absolute inset-0 rounded-lg bg-amber-400/10 blur-md" />
          </div>
          <div>
            <h2
              className="font-bold text-white text-sm leading-tight"
              style={{ textShadow: '0 0 20px rgba(217, 119, 6, 0.15)' }}
            >
              Abyssal Academy
            </h2>
            <p className="text-teal-300/70 text-[10px]">Management Portal</p>
          </div>
        </div>

        <GradientSeparator />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={cn(
                  'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  'transition-all duration-300 ease-out',
                  // Base styles
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-teal-200/80 hover:bg-white/8 hover:text-white',
                  // Left border indicator - always present as invisible, slides in on hover/active
                  isActive
                    ? 'border-l-[3px] border-amber-400 pl-[9px]'
                    : 'border-l-[3px] border-transparent pl-[9px] hover:border-amber-400/40'
                )}
              >
                {/* Icon with subtle color transition */}
                <span className={cn(
                  'transition-colors duration-300',
                  isActive ? 'text-amber-300' : 'text-teal-300/70 group-hover:text-teal-200'
                )}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {/* Active indicator dot with pulse */}
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-amber-400 active-dot-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin profile section with gradient separator */}
        <AdminSeparator />
        <div className="p-3">
          {admin && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
              <Avatar className="h-8 w-8 border border-white/15">
                <AvatarFallback className="bg-amber-400/20 text-amber-300 text-xs font-bold">
                  {admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                <p className="text-[11px] text-teal-300/60 truncate">@{admin.username}</p>
              </div>
              <Star className="h-3.5 w-3.5 text-amber-400/70" />
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
              'text-teal-200/70',
              'hover:text-red-300 hover:bg-red-500/15',
              'transition-all duration-300 ease-out'
            )}
          >
            <LogOut className="h-5 w-5 transition-colors duration-300 group-hover:text-red-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileHeader() {
  const currentPage = useAppStore((s) => s.currentPage);
  const admin = useAppStore((s) => s.admin);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pageTitle = navItems.find((item) => item.page === currentPage)?.label || 'Dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-14 flex items-center px-4 gap-3',
        'transition-all duration-300 ease-out',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background border-b border-border'
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-72"
          style={{ '--sheet-background': '#003B5C' } as React.CSSProperties}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{pageTitle}</h1>
      </div>
      {admin && (
        <Avatar className="h-8 w-8 bg-primary border border-primary/20">
          <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs font-bold">
            {admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}
    </header>
  );
}

/** Wrapper that applies a subtle fade transition when navigating between pages */
function PageTransitionWrapper({ currentPage, children }: { currentPage: string; children: ReactNode }) {
  return (
    <div key={currentPage} className="page-transition">
      {children}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const currentPage = useAppStore((s) => s.currentPage);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MobileHeader />
        <main className="flex-1 p-4">
          <PageTransitionWrapper currentPage={currentPage}>
            {children}
          </PageTransitionWrapper>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className="relative w-64 shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #003B5C 0%, #001D2E 100%)' }}
      >
        {/* Subtle vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, transparent 50%, rgba(0, 20, 35, 0.3) 100%)',
          }}
        />
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top gradient accent border */}
        <div
          className="h-[2px] shrink-0"
          style={{
            background: 'linear-gradient(90deg, #003B5C 0%, #006D8A 30%, #D97706 70%, #003B5C 100%)',
          }}
        />
        <main className="flex-1 p-6">
          <PageTransitionWrapper currentPage={currentPage}>
            {children}
          </PageTransitionWrapper>
        </main>
      </div>
    </div>
  );
}
