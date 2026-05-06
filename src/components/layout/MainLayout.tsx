import { Outlet, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, PlusCircle, BarChart3,
  User, Binary, Trophy, BookOpen, Settings, ChevronLeft,
  ChevronRight, Swords, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { getLevelInfo, getXPProgress } from '../../engine/levelSystem';
import type { PlayerProfile, PlayerStats } from '../../types/player';

const NAV = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/trades',       label: 'Trade Log',    icon: ListOrdered },
  { to: '/trades/new',   label: 'New Trade',    icon: PlusCircle },
  { to: '/analytics',    label: 'Analytics',    icon: BarChart3 },
  { to: '/profile',      label: 'Profile',      icon: User },
  { to: '/skills',       label: 'Skill Tree',   icon: Binary },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/journal',      label: 'Journal',      icon: BookOpen },
  { to: '/settings',     label: 'Settings',     icon: Settings },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading, logout } = useSupabaseAuth();

  // Fetch player profile for XP bar
  const { data: profile } = useQuery<PlayerProfile>({
    queryKey: ['player', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('player_profiles').select('*').eq('user_id', user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const xpProgress = profile ? getXPProgress(profile.total_xp) : null;
  const levelInfo  = profile ? getLevelInfo(profile.total_xp) : null;

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-200 shrink-0"
        style={{ width: collapsed ? '64px' : '240px' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 overflow-hidden">
          <Swords className="shrink-0 text-purple-400" size={22} />
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-gray-100 leading-tight">GrimoireXBT</p>
              <p className="text-xs text-gray-500">Trading Journal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-purple-600/20 text-purple-400 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-800 p-2">
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center py-3 border-t border-gray-800 text-gray-600 hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* TopBar */}
        <header className="flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm shrink-0 h-14">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 uppercase tracking-wider">XP</span>
            <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress?.percent ?? 0}%` }}
              />
            </div>
            <span className="text-xs text-purple-400 font-mono whitespace-nowrap">
              Lv.{levelInfo?.level ?? 1} · {levelInfo?.rankTitle ?? 'Novice'}
            </span>
          </div>
          <span className="text-xs text-gray-600 hidden sm:block">{user.email}</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
