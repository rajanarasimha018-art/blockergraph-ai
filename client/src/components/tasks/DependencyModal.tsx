import React, { useState } from 'react';
import { Task } from '../../types';
import { Modal } from '../ui/Modal';
import { ArrowRight, AlertOctagon } from 'lucide-react';

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSubmit: (sourceTaskId: string, targetTaskId: string) => Promise<void>;
}

export const DependencyModal: React.FC<DependencyModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSubmit
}) => {
  const [sourceId, setSourceId] = useState<string>(tasks[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(tasks[1]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      setError('Please select both prerequisite and dependent tasks');
      return;
    }

    if (sourceId === targetId) {
      setError('Self-dependency rejected: A task cannot depend on itself.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(sourceId, targetId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create dependency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Dependency Link"
      description="Connect tasks with finish-to-start topological precedence."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] text-xs flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Prerequisite Task (Upstream)
          </label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.assignedTo})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">This task must be completed first.</p>
        </div>

        <div className="flex justify-center">
          <div className="p-1.5 rounded-full bg-[#0D111B] border border-[#263044] text-slate-400">
            <ArrowRight className="w-4 h-4 text-[#22D3EE] rotate-90 md:rotate-0" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Dependent Task (Downstream)
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.assignedTo})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">This task will be blocked until prerequisite completes.</p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#263044]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#0D111B] hover:bg-[#1A2333] text-slate-300 border border-[#263044] text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Validating Graph...' : 'Establish Link'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
