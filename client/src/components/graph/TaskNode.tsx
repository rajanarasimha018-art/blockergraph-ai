import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Task } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { Clock, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface TaskNodeData {
  task: Task;
  isCritical?: boolean;
  isSimulatedAffected?: boolean;
  isSimulatedRisk?: boolean;
  onSelectTask?: (task: Task) => void;
}

export const TaskNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as TaskNodeData;
  const task = nodeData.task;
  const isCritical = nodeData.isCritical || task.cpmMetrics?.isCritical;
  const isBlocked = task.status === 'Blocked' || task.blockerInfo?.isBlocked;
  const isCompleted = task.status === 'Completed';

  // Linear / Vercel Card state styling
  let containerBorder = 'border-[#263044] hover:border-[#3B4B68]';
  let statusAccentBar = 'bg-slate-600';

  if (nodeData.isSimulatedRisk) {
    containerBorder = 'border-[#EF4444] ring-2 ring-[#EF4444]/40';
    statusAccentBar = 'bg-[#EF4444]';
  } else if (nodeData.isSimulatedAffected) {
    containerBorder = 'border-[#F59E0B] ring-2 ring-[#F59E0B]/40';
    statusAccentBar = 'bg-[#F59E0B]';
  } else if (isCritical && !isCompleted) {
    containerBorder = 'border-[#F59E0B]/80 ring-1 ring-[#F59E0B]/30';
    statusAccentBar = 'bg-[#F59E0B]';
  } else if (isBlocked) {
    containerBorder = 'border-[#EF4444]/60 bg-[#EF4444]/[0.02]';
    statusAccentBar = 'bg-[#EF4444]';
  } else if (isCompleted) {
    containerBorder = 'border-[#10B981]/40';
    statusAccentBar = 'bg-[#10B981]';
  } else if (selected) {
    containerBorder = 'border-[#6366F1] ring-2 ring-[#6366F1]/30';
    statusAccentBar = 'bg-[#6366F1]';
  }

  return (
    <div
      onClick={() => nodeData.onSelectTask?.(task)}
      className={`relative w-[270px] rounded-xl bg-[#111827] text-left border shadow-lg transition-all duration-150 cursor-pointer ${containerBorder} hover:translate-y-[-1px] overflow-hidden`}
    >
      {/* Target handle (Prerequisites enter Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-400 hover:!bg-[#22D3EE] !border-2 !border-[#080B12]"
      />

      {/* Top Status Accent Bar */}
      <div className={`h-1 w-full ${statusAccentBar}`} />

      <div className="p-3.5 space-y-2">
        {/* Critical Path Header Badge if applicable */}
        {isCritical && !isCompleted && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 w-fit">
            <Sparkles className="w-2.5 h-2.5" />
            CRITICAL PATH (0 FLOAT)
          </div>
        )}

        {/* Priority & Status Row */}
        <div className="flex items-center justify-between">
          <PriorityBadge priority={task.priority} size="sm" />
          <StatusBadge status={task.status} size="sm" />
        </div>

        {/* Task Title */}
        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Assignee & Duration */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#263044]/60">
          <span className="truncate max-w-[130px] font-medium text-slate-300">
            {task.assignedTo}
          </span>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-[#0D111B] px-1.5 py-0.5 rounded border border-[#263044]">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>{task.duration}d</span>
          </div>
        </div>

        {/* Dynamic Blocker / Downstream Impact Footer */}
        {isBlocked && task.blockerInfo && task.blockerInfo.blockingPrerequisites.length > 0 && (
          <div className="p-1.5 rounded bg-[#EF4444]/10 border border-[#EF4444]/25 text-[10px] text-[#FCA5A5] flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-3 h-3 text-[#EF4444] shrink-0" />
            <span className="truncate">
              Waiting on: <strong className="text-white">{task.blockerInfo.blockingPrerequisites[0].title}</strong>
            </span>
          </div>
        )}

        {!isBlocked && !isCompleted && task.blockerInfo && task.blockerInfo.dependentCount > 0 && (
          <div className="px-2 py-1 rounded bg-[#0D111B] border border-[#263044] text-[10px] text-slate-300 flex items-center justify-between font-mono">
            <span className="text-slate-400 uppercase text-[9px]">Downstream</span>
            <span className="text-[#38BDF8] font-bold">
              {task.blockerInfo.dependentCount} tasks
            </span>
          </div>
        )}

        {isCompleted && (
          <div className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[10px] text-[#34D399] flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Deliverable Complete</span>
          </div>
        )}
      </div>

      {/* Source handle (Downstream dependents exit Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-[#6366F1] hover:!bg-white !border-2 !border-[#080B12]"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
