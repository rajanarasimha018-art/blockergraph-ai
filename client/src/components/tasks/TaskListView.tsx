import React, { useState } from 'react';
import { Task, TaskDependency, TaskStatus } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  TrendingDown
} from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  dependencies: TaskDependency[];
  onOpenCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onSimulateDelay: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  dependencies: _dependencies,
  onOpenCreateTask,
  onEditTask,
  onDeleteTask,
  onUpdateStatus,
  onSimulateDelay
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111827] border border-[#263044]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks by name, assignee, or tag..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-slate-300 text-xs focus:outline-none focus:border-[#6366F1]"
          >
            <option value="all">All Statuses</option>
            <option value="Ready">Ready</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D111B] border border-[#263044] text-slate-300 text-xs focus:outline-none focus:border-[#6366F1]"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-xl bg-[#111827] border border-[#263044] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#263044] text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-[#0D111B]">
                <th className="py-2.5 pl-4">Task Details</th>
                <th className="py-2.5">Assignee</th>
                <th className="py-2.5">Priority</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Duration & Float</th>
                <th className="py-2.5">Schedule</th>
                <th className="py-2.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263044]/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tasks match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#162033] transition-colors">
                    <td className="py-3 pl-4 max-w-[260px]">
                      <div className="font-semibold text-white truncate">{task.title}</div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-[#0D111B] text-slate-400 font-mono border border-[#263044]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3 text-slate-300 font-medium">{task.assignedTo}</td>

                    <td className="py-3">
                      <PriorityBadge priority={task.priority} size="sm" />
                    </td>

                    <td className="py-3">
                      <StatusBadge status={task.status} size="sm" />
                    </td>

                    <td className="py-3 font-mono text-slate-300">
                      {task.duration}d{' '}
                      <span className="text-[10px] text-slate-400">
                        ({task.cpmMetrics?.slack ?? 0}d float)
                      </span>
                    </td>

                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {task.startDate} → {task.dueDate}
                    </td>

                    <td className="py-3 pr-4 text-right space-x-1">
                      {task.status !== 'Completed' ? (
                        <button
                          onClick={() => onUpdateStatus(task.id, 'Completed')}
                          title="Mark Task Completed"
                          className="p-1 rounded bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#34D399] transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(task.id, 'In Progress')}
                          title="Reopen Task"
                          className="p-1 rounded bg-[#0D111B] hover:bg-[#1A2333] text-slate-400 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onSimulateDelay(task)}
                        title="Simulate Delay on this task"
                        className="p-1 rounded bg-[#0D111B] hover:bg-[#1A2333] text-[#F59E0B] transition-colors"
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit Task"
                        className="p-1 rounded bg-[#0D111B] hover:bg-[#1A2333] text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete Task"
                        className="p-1 rounded bg-[#0D111B] hover:bg-[#EF4444]/20 text-slate-400 hover:text-[#F87171] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
