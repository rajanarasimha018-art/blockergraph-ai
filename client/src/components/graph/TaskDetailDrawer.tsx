import React from 'react';
import { Task, TaskDependency } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  Trash2,
  Edit2
} from 'lucide-react';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onSimulateDelay: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  allTasks: Task[];
  dependencies: TaskDependency[];
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onSimulateDelay,
  onEditTask,
  onDeleteTask,
  allTasks,
  dependencies
}) => {
  if (!task) return null;

  const isBlocked = task.status === 'Blocked' || task.blockerInfo?.isBlocked;
  const cpm = task.cpmMetrics;

  const prereqDeps = dependencies.filter((d) => d.targetTaskId === task.id);
  const dependentDeps = dependencies.filter((d) => d.sourceTaskId === task.id);

  const prereqTasks = prereqDeps
    .map((d) => allTasks.find((t) => t.id === d.sourceTaskId))
    .filter(Boolean) as Task[];

  const dependentTasks = dependentDeps
    .map((d) => allTasks.find((t) => t.id === d.targetTaskId))
    .filter(Boolean) as Task[];

  return (
    <div className="absolute top-0 right-0 z-30 w-96 h-full bg-[#0D111B] border-l border-[#263044] shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-[#263044] flex items-start justify-between bg-[#111827]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <PriorityBadge priority={task.priority} size="sm" />
            <StatusBadge status={task.status} size="sm" />
          </div>
          <h3 className="text-sm font-bold text-white leading-tight">{task.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 overflow-y-auto flex-1 space-y-5 text-xs">
        {/* Description */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Task Description
          </span>
          <p className="text-slate-300 bg-[#111827] p-3 rounded-lg border border-[#263044] leading-relaxed">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263044]">
            <span className="text-[10px] text-slate-400 block">Assignee</span>
            <span className="font-semibold text-white mt-0.5 block truncate">{task.assignedTo}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263044]">
            <span className="text-[10px] text-slate-400 block">Duration & Float</span>
            <span className="font-semibold text-white mt-0.5 block font-mono">
              {task.duration}d duration ({cpm ? `${cpm.slack}d float` : '0d'})
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263044]">
            <span className="text-[10px] text-slate-400 block">Start Date</span>
            <span className="font-semibold text-white mt-0.5 block font-mono">{task.startDate}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263044]">
            <span className="text-[10px] text-slate-400 block">Target Due Date</span>
            <span className="font-semibold text-white mt-0.5 block font-mono">{task.dueDate}</span>
          </div>
        </div>

        {/* Blocker Analysis Section (Requirement H) */}
        {isBlocked && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-2.5">
            <div className="flex items-center gap-2 text-[#F87171] font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>Blocker Engine Diagnostic</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[#FCA5A5] text-[11px] font-medium">Blocking Prerequisites:</span>
              {prereqTasks
                .filter((p) => p.status !== 'Completed')
                .map((prereq) => (
                  <div
                    key={prereq.id}
                    className="p-2 rounded bg-[#EF4444]/15 border border-[#EF4444]/25 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-white truncate">{prereq.title}</p>
                      <p className="text-[10px] text-[#FCA5A5]">
                        {prereq.assignedTo} • Due {prereq.dueDate}
                      </p>
                    </div>
                    <button
                      onClick={() => onUpdateStatus(prereq.id, 'Completed')}
                      className="px-2 py-0.5 rounded bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#34D399] text-[10px] font-bold border border-[#10B981]/40 transition-colors shrink-0"
                    >
                      Mark Done
                    </button>
                  </div>
                ))}
            </div>

            {task.blockerInfo?.suggestedNextAction && (
              <div className="pt-2 border-t border-[#EF4444]/20 text-[11px]">
                <span className="text-[#F87171] font-semibold block mb-0.5">Suggested Action:</span>
                <p className="text-slate-300 leading-relaxed">
                  {task.blockerInfo.suggestedNextAction}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Downstream Impact List */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
            <span>Downstream Dependents</span>
            <span className="text-[#38BDF8] font-mono">{dependentTasks.length} tasks</span>
          </span>

          {dependentTasks.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic p-2.5 rounded bg-[#111827] border border-[#263044]">
              No downstream tasks depend on this item (Terminal DAG node).
            </p>
          ) : (
            <div className="space-y-1.5">
              {dependentTasks.map((dep) => (
                <div
                  key={dep.id}
                  className="p-2 rounded bg-[#111827] border border-[#263044] flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-white truncate">{dep.title}</p>
                    <p className="text-[10px] text-slate-400">{dep.assignedTo}</p>
                  </div>
                  <StatusBadge status={dep.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Path Method (CPM) Metrics */}
        {cpm && (
          <div className="p-3 rounded-xl bg-[#111827] border border-[#263044] space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              CPM Schedule Bounds
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-slate-400">Earliest:</span>{' '}
                <span className="text-[#38BDF8]">{cpm.earliestStartDate}</span> →{' '}
                <span className="text-[#38BDF8]">{cpm.earliestFinishDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Latest:</span>{' '}
                <span className="text-[#A5B4FC]">{cpm.latestStartDate}</span> →{' '}
                <span className="text-[#A5B4FC]">{cpm.latestFinishDate}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              Total Float: <span className={cpm.slack === 0 ? 'text-[#F59E0B] font-bold' : 'text-slate-200'}>{cpm.slack} days</span>
              {cpm.isCritical && ' (Critical Path Member)'}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-[#263044] bg-[#0D111B] space-y-2">
        <button
          onClick={() => onSimulateDelay(task)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <TrendingDown className="w-3.5 h-3.5 text-[#FCD34D]" />
          <span>Simulate Delay On This Task</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {task.status !== 'Completed' ? (
            <button
              onClick={() => onUpdateStatus(task.id, 'Completed')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#34D399] text-xs font-medium border border-[#10B981]/30 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(task.id, 'In Progress')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7]/15 hover:bg-[#0284C7]/25 text-[#38BDF8] text-xs font-medium border border-[#0284C7]/30 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Reopen</span>
            </button>
          )}

          <button
            onClick={() => onEditTask(task)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1A2333] text-slate-300 text-xs font-medium border border-[#263044] transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <button
          onClick={() => onDeleteTask(task.id)}
          className="w-full flex items-center justify-center gap-1 px-3 py-1 text-[#EF4444] hover:text-[#FCA5A5] text-[11px] font-medium transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete Task</span>
        </button>
      </div>
    </div>
  );
};
