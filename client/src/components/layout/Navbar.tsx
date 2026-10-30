import React, { useState } from 'react';
import { Project, User } from '../../types';
import {
  Share2,
  GitBranch,
  TrendingDown,
  BarChart3,
  ListTodo,
  Sparkles,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Activity
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface NavbarProps {
  currentTab: 'overview' | 'graph' | 'simulator' | 'analytics' | 'tasks';
  onSelectTab: (tab: 'overview' | 'graph' | 'simulator' | 'analytics' | 'tasks') => void;
  project: Project;
  user: User | null;
  onResetDemo: () => void;
  resetLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  project,
  user,
  onResetDemo,
  resetLoading
}) => {
  const [showDemoGuide, setShowDemoGuide] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo & Project Title */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => onSelectTab('overview')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-blue via-electric-violet to-electric-cyan p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-electric-cyan" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      BlockerGraph
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-electric-violet/20 border border-electric-violet/40 text-electric-violet">
                      AI
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                    Intelligent Dependency Engine
                  </span>
                </div>
              </div>

              {/* Project Badge */}
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10 text-xs">
                <span className="text-slate-400">Workspace:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                  {project.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>

            {/* Middle: Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              <button
                onClick={() => onSelectTab('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'overview'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Overview
              </button>

              <button
                onClick={() => onSelectTab('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'graph'
                    ? 'bg-electric-cyan text-slate-950 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Dependency Graph
              </button>

              <button
                onClick={() => onSelectTab('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'simulator'
                    ? 'bg-electric-violet text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                Delay Simulator
              </button>

              <button
                onClick={() => onSelectTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'analytics'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                Analytics & CPM
              </button>

              <button
                onClick={() => onSelectTab('tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'tasks'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                Task Board
              </button>
            </nav>

            {/* Right: Hackathon Actions & User Profile */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowDemoGuide(true)}
                title="Hackathon Demo Script"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Demo Guide
              </button>

              <button
                onClick={onResetDemo}
                disabled={resetLoading}
                title="Reset dataset back to seed scenario"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reset Seed</span>
              </button>

              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  />
                  <div className="hidden xl:block text-left">
                    <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Demo Scenario Guide Modal (Walkthrough for judges) */}
      <Modal
        isOpen={showDemoGuide}
        onClose={() => setShowDemoGuide(false)}
        title="Hackathon Demonstration Playbook"
        description="Follow this exact sequence to demonstrate all core features of BlockerGraph AI."
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
            This live demonstration proves all 9 judging checkpoints from Section 8 of the challenge specification.
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">1</span>
                Explore Dashboard & Overview
              </div>
              <p className="text-slate-400 pl-6.5 text-[11px]">
                Review the 16 realistic software tasks, completion rate, overdue warnings, and active blockers.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">2</span>
                Inspect the Interactive Dependency Graph
              </div>
              <p className="text-slate-400 pl-6.5 text-[11px]">
                Click on "Dependency Graph" tab. Pan, zoom, and click any node to open the diagnostics drawer showing dynamic blockers and CPM bounds.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">3</span>
                Identify a Blocked Task
              </div>
              <p className="text-slate-400 pl-6.5 text-[11px]">
                Click task "Stripe Billing & Subscription Webhooks" (marked Blocked in red). The drawer pinpoints the prerequisite "API Gateway & Edge Routing" and suggests next actions.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">4</span>
                Simulate a 2-Day Delay in Upstream Task
              </div>
              <p className="text-slate-400 pl-6.5 text-[11px]">
                Switch to "Delay Simulator". Select "API Gateway & Edge Routing" and drag slider to +2 days. The system immediately recalculates CPM schedules, highlights shifted downstream tasks, and identifies tasks at risk.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">5</span>
                Attempt Circular Dependency & Watch System Reject It
              </div>
              <p className="text-slate-400 pl-6.5 text-[11px]">
                In the graph or via "Link Dependency", attempt to link downstream "SOC2 Compliance Audit" or "Global DNS Cutover" back to an upstream task like "Architecture Design". The cycle engine immediately intercepts it and displays the Cycle Rejection Modal with the exact loop path!
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">6</span>
                View Critical Path & Analytics
              </div>
              <p className="text-slate-400 pl-6.5 text-[11px]">
                Toggle "Highlight Critical Path" on the graph or visit "Analytics & CPM" to review float distribution and AI project intelligence insights.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowDemoGuide(false)}
              className="px-4 py-2 rounded-xl bg-electric-cyan hover:bg-sky-400 text-slate-950 font-semibold text-xs"
            >
              Ready to Test
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
