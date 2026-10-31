import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus } from '../../types';
import { Modal } from '../ui/Modal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('Team Xspark');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [dueDate, setDueDate] = useState('2026-11-05');
  const [duration, setDuration] = useState(3);
  const [status, setStatus] = useState<TaskStatus>('Ready');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setAssignedTo(initialTask.assignedTo);
      setPriority(initialTask.priority);
      setStartDate(initialTask.startDate);
      setDueDate(initialTask.dueDate);
      setDuration(initialTask.duration);
      setStatus(initialTask.status);
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo('Team Xspark');
      setPriority('Medium');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]);
      setDuration(3);
      setStatus('Ready');
    }
    setError(null);
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description,
        assignedTo,
        priority,
        startDate,
        dueDate,
        duration: Number(duration),
        status
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task Parameters' : 'Create New Engineering Task'}
      description="Define duration, priority, prerequisites, and milestone schedule."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Task Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement Envoy Proxy Rate Limiting"
            className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, technical criteria, or deliverables..."
            className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Assignee</label>
            <input
              type="text"
              required
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (days)</label>
            <input
              type="number"
              min="1"
              required
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
          >
            <option value="Ready">Ready</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>
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
            {loading ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
