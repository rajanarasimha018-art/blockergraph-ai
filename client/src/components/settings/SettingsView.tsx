import React, { useState } from 'react';
import { Project, User } from '../../types';
import {
  Settings,
  Database,
  Shield,
  Key,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Zap
} from 'lucide-react';

interface SettingsViewProps {
  project: Project;
  user: User | null;
  onResetDemo: () => void;
  resetLoading?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  project,
  user,
  onResetDemo,
  resetLoading
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(`-- BlockerGraph AI Schema: See server/src/db/schema.sql`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-[#263044]">
        <h1 className="text-xl font-bold text-white tracking-tight">System & Workspace Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure Supabase PostgreSQL database integration, CPM graph engine rules, and team metadata.
        </p>
      </div>

      {/* Team Hackathon Meta */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Hackathon Project Metadata
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0D111B] border border-[#263044]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Team Name</span>
            <div className="font-bold text-white font-mono mt-0.5">XSPARK</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0D111B] border border-[#263044]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Problem Statement</span>
            <div className="font-bold text-[#818CF8] font-mono mt-0.5">HACK-P395</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0D111B] border border-[#263044]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Application</span>
            <div className="font-bold text-white font-mono mt-0.5">BlockerGraph AI</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0D111B] border border-[#263044]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Engine Version</span>
            <div className="font-bold text-[#34D399] font-mono mt-0.5">v2.4 (DAG + CPM)</div>
          </div>
        </div>
      </div>

      {/* Database Integration */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#22D3EE]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Supabase PostgreSQL Database
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 text-[10px] font-bold">
            Schema Synchronized
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          BlockerGraph AI connects directly to Supabase PostgreSQL with full row-level security (RLS) policies and foreign key constraints on tasks, dependencies, and audit logs.
        </p>

        <div className="p-3.5 rounded-lg bg-[#0D111B] border border-[#263044] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-[#263044]">
            <span>PostgreSQL Schema: server/src/db/schema.sql</span>
            <button
              onClick={handleCopySchema}
              className="text-[#818CF8] hover:text-[#A5B4FC] text-[10px]"
            >
              {copied ? 'Copied!' : 'Copy Path'}
            </button>
          </div>
          <div className="text-[11px] text-slate-300">
            ✓ Tables: public.projects, public.tasks, public.task_dependencies, public.activity_logs
            <br />
            ✓ Constraints: CHECK (source_task_id != target_task_id), UNIQUE (source_task_id, target_task_id)
            <br />
            ✓ Engine: Hybrid Supabase client + Zero-latency persistent local fallback
          </div>
        </div>
      </div>

      {/* Seed Reset Card */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Reset Demo Dataset
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Restores the sample 16-task distributed cloud project with multiple dependency chains and critical path.
          </p>
        </div>
        <button
          onClick={onResetDemo}
          disabled={resetLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#F87171] border border-[#EF4444]/30 text-xs font-bold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetLoading ? 'animate-spin' : ''}`} />
          <span>Reset Project Seed</span>
        </button>
      </div>
    </div>
  );
};
