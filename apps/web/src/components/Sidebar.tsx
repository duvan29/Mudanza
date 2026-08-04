'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Wallet, ShoppingBag, BarChart3, Map, LogOut, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/fondos', label: 'Fondos', icon: Wallet },
  { href: '/productos', label: 'Productos', icon: ShoppingBag },
  { href: '/metricas', label: 'Metricas', icon: BarChart3 },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-surface border-r border-border-light min-h-screen p-5">
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-3 mb-6">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-primary-light to-primary flex items-center justify-center shadow-sm">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-text leading-tight">Mudanza</h1>
            <p className="text-[11px] text-text-muted">Ene 2027</p>
          </div>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-surface-alt rounded-[var(--radius-md)] border border-border-light">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-light to-secondary flex items-center justify-center">
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">{userName}</p>
            <p className="text-[11px] text-text-muted truncate">{userEmail}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all',
                  active
                    ? 'bg-primary-light/25 text-primary-dark shadow-sm border border-primary-light/40'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
                {active && (
                  <ChevronRight size={14} className="ml-auto text-primary opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-text-muted hover:bg-error/10 hover:text-error-dark transition-all mt-4"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Cerrar sesion
        </button>
      </aside>

      {/* Mobile: top bar with user + logout */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border-light">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-light to-secondary flex items-center justify-center">
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text">{userName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-[var(--radius-sm)] text-text-muted hover:bg-error/10 hover:text-error-dark transition-all"
          title="Cerrar sesion"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-border-light flex justify-around py-2 px-1 z-50">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[10px] font-medium transition-all min-w-[56px]',
                active
                  ? 'text-primary-dark bg-primary-light/20'
                  : 'text-text-muted'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
