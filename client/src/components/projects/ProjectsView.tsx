import React, { useState } from 'react';
import { Project } from '../../types';
import {
  FolderKanban,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../ui/Modal';

interface ProjectsViewProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (id: string) => void;
  onCreateProject: (data: Partial<Project>) => Promise<void>;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [targetDate, setTargetDate] = useState('2026-12-30');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreateProject({
        name,
        description,
        startDate,
        targetDate,
        status: 'active'
      });
      setModalOpen(false);
      setName('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#263044]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Workspace Projects</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-repo engineering projects, milestone dates, and active teams.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isActive = proj.id === activeProject.id;
          return (
            <div
              key={proj.id}
              className={`p-5 rounded-xl bg-[#111827] border transition-all flex flex-col justify-between space-y-4 ${
                isActive ? 'border-[#6366F1] ring-1 ring-[#6366F1]/30' : 'border-[#263044] hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    ID: {proj.id}
                  </span>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#263044]/60 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Start: {proj.startDate}</span>
                  <span>Target: {proj.targetDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="text-white capitalize">{proj.status}</strong>
                  </span>
                  {!isActive ? (
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="px-2.5 py-1 rounded bg-[#0D111B] hover:bg-[#162033] text-white border border-[#263044] text-[11px] font-medium transition-colors"
                    >
                      Switch to Project
                    </button>
                  ) : (
                    <span className="text-xs text-[#818CF8] font-semibold flex items-center gap-1">
                      Current Workspace
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Project"
        description="Set up a new project workspace with custom delivery milestones."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Hypervisor v3.0"
              className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Engineering objectives and architecture scope..."
              className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#263044]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-[#111827] text-slate-300 border border-[#263044] text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs transition-colors"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
