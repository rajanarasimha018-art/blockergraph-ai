import React, { useState } from 'react';
import { Project, User } from '../../types';
import { TabKey } from './AppSidebar';
import {
  Search,
  RotateCcw,
  BookOpen,
  Bell,
  ChevronDown,
  Layers,
  Sparkles,
  Command
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface AppHeaderProps {
  currentTab: TabKey;
  project: Project;
  allProjects: Project[];
  onSelectProject: (id: string) => void;
  user: User | null;
  onResetDemo: () => void;
  resetLoading?: boolean;
  blockedCount: number;
  onOpenCreateTask: () => void;
  onSearchFocus?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  project,
  allProjects,
  onSelectProject,
  user,
  onResetDemo,
  resetLoading,
  blockedCount,
  onOpenCreateTask
}) => {
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const tabLabels: Record<TabKey, string> = {
    overview: 'Project Overview',
    projects: 'All Projects',
    tasks: 'Task Management',
    graph: 'Dependency Graph Canvas',
    simulator: 'Delay Impact Simulator',
    analytics: 'Analytics & Critical Path',
    settings: 'Settings & Integrations'
  };

  return (
    <>
      <header className="h-16 border-b border-[#263044] bg-[#080B12]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Breadcrumbs & Project Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Team Xspark</span>
            <span className="text-slate-600">/</span>

            {/* Project Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827] border border-[#263044] hover:border-slate-500 text-white font-semibold transition-colors"
              >
                <span className="truncate max-w-[180px]">{project.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {projectDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 rounded-lg bg-[#111827] border border-[#263044] shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-[#263044]">
                    Switch Workspace Project
                  </div>
                  {allProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1F293D] transition-colors ${
                        p.id === project.id ? 'text-[#818CF8] font-bold bg-[#6366F1]/10' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.id === project.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium">{tabLabels[currentTab]}</span>
          </div>
        </div>

        {/* Center: Global Quick Search (Linear Style) */}
        <div className="hidden md:flex items-center w-72 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              onClick={onOpenCreateTask}
              placeholder="Quick search or jump to task..."
              className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-xs text-slate-300 placeholder:text-slate-400 focus:outline-none cursor-pointer hover:border-slate-500 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-[#162033] px-1.5 py-0.5 rounded border border-[#263044]">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Hackathon Demo Guide Trigger */}
          <button
            onClick={() => setShowDemoGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/30 text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>Demo Playbook</span>
          </button>

          {/* Reset Seed Button */}
          <button
            onClick={onResetDemo}
            disabled={resetLoading}
            title="Reset dataset to initial 16 tasks"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1A2333] text-slate-300 border border-[#263044] text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

          {/* Blockers Notification Pill */}
          <div className="relative">
            <button
              title={`${blockedCount} active blocked tasks`}
              className="p-2 rounded-lg bg-[#111827] border border-[#263044] text-slate-400 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {blockedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                  {blockedCount}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar */}
          {user && (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full border border-[#263044] object-cover"
            />
          )}
        </div>
      </header>

      {/* Demo Scenario Guide Modal */}
      <Modal
        isOpen={showDemoGuide}
        onClose={() => setShowDemoGuide(false)}
        title="Hackathon Demonstration Playbook"
        description="Verify all 9 judging checkpoints from Section 8 of HACK-P395."
        maxWidth="xl"
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#C7D2FE] leading-relaxed">
            <strong>System:</strong> BlockerGraph AI • <strong>Team:</strong> XSPARK • <strong>Problem:</strong> HACK-P395
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263044] space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center font-mono text-[10px]">1</span>
                Project Overview Dashboard
              </div>
              <p className="text-slate-400 pl-6 text-[11px]">
                Inspect 16 tasks, completion progress, 9 active blockers, and upcoming deadlines.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263044] space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center font-mono text-[10px]">2</span>
                Dependency Graph Canvas
              </div>
              <p className="text-slate-400 pl-6 text-[11px]">
                Switch to 'Dependency Graph'. Click 'Stripe Billing Webhooks' to inspect uncompleted prerequisites in the details drawer.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263044] space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center font-mono text-[10px]">3</span>
                Delay Impact Simulator
              </div>
              <p className="text-slate-400 pl-6 text-[11px]">
                Switch to 'Delay Simulator'. Select 'API Gateway' and apply +2 days. View cascading schedule slippage across downstream tasks.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263044] space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center font-mono text-[10px]">4</span>
                Circular Dependency Rejection
              </div>
              <p className="text-slate-400 pl-6 text-[11px]">
                Connect a downstream task (e.g. SOC2 Audit) back to an upstream task. DFS cycle detection intercepts it and presents the Cycle Rejection Modal.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263044] space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center font-mono text-[10px]">5</span>
                Critical Path & Analytics
              </div>
              <p className="text-slate-400 pl-6 text-[11px]">
                Review the zero-float critical path sequence and AI project intelligence insights.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowDemoGuide(false)}
              className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs transition-colors"
            >
              Close Playbook
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
