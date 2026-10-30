import React from 'react';
import { User, Project } from '../../types';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  GitBranch,
  TrendingDown,
  BarChart3,
  Settings,
  Share2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export type TabKey = 'overview' | 'projects' | 'tasks' | 'graph' | 'simulator' | 'analytics' | 'settings';

interface AppSidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  project: Project;
  user: User | null;
  blockedCount: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  project,
  user,
  blockedCount
}) => {
  const navItems: { key: TabKey; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      key: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-4 h-4" />
    },
    {
      key: 'tasks',
      label: 'Task Board',
      icon: <ListTodo className="w-4 h-4" />
    },
    {
      key: 'graph',
      label: 'Dependency Graph',
      icon: <GitBranch className="w-4 h-4 text-[#22D3EE]" />,
      badge: blockedCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#F87171] text-[10px] font-bold font-mono">
          {blockedCount}
        </span>
      ) : null
    },
    {
      key: 'simulator',
      label: 'Delay Simulator',
      icon: <TrendingDown className="w-4 h-4 text-[#F59E0B]" />,
      badge: (
        <span className="px-1.5 py-0.2 rounded bg-[#6366F1]/20 text-[#A5B4FC] text-[9px] font-mono font-semibold">
          CPM
        </span>
      )
    },
    {
      key: 'analytics',
      label: 'Analytics & CPM',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-[#0D111B] border-r border-[#263044] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand & Workspace Section */}
      <div>
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#263044]">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white shadow-sm shadow-[#6366F1]/30">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-tight text-white">BlockerGraph</span>
              <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/40">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider block mt-1">
              v2.4 • HACK-P395
            </span>
          </div>
        </div>

        {/* Project Context Box */}
        <div className="p-3">
          <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263044]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              <span>Active Workspace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            </div>
            <div className="text-xs font-semibold text-white truncate" title={project.name}>
              {project.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>Target: {project.targetDate}</span>
              <span className="text-[#34D399]">16 Tasks</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#6366F1]/15 text-[#818CF8] font-semibold border-l-2 border-[#6366F1]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#818CF8]' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar: Team & User Profile */}
      <div className="border-t border-[#263044] p-3 space-y-3 bg-[#0D111B]/80">
        {/* Team Xspark Brand Pill */}
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263044] text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#F59E0B]/15 text-[#F59E0B]">
              <Zap className="w-3 h-3" />
            </span>
            <div>
              <div className="font-bold text-white tracking-wide">TEAM XSPARK</div>
              <div className="text-[9px] text-slate-400 font-mono">Project Dependency Manager</div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300">
            PROD
          </span>
        </div>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#111827] transition-colors cursor-pointer">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#263044]"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] border-2 border-[#0D111B]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
