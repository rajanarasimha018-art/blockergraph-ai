import React from 'react';
import { Project, Task, TaskDependency, ActivityLog } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  ArrowRight,
  TrendingDown,
  Plus,
  GitBranch,
  ShieldAlert,
  Sparkles,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface OverviewDashboardProps {
  project: Project;
  tasks: Task[];
  dependencies: TaskDependency[];
  activityLogs: ActivityLog[];
  onOpenGraph: () => void;
  onOpenSimulator: (task?: Task) => void;
  onOpenCreateTask: () => void;
  onSelectTask: (task: Task) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Ready: '#10B981',
  'In Progress': '#38BDF8',
  Blocked: '#EF4444',
  Completed: '#64748B'
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: '#64748B',
  Medium: '#6366F1',
  High: '#F59E0B',
  Critical: '#EF4444'
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  project,
  tasks,
  dependencies,
  activityLogs,
  onOpenGraph,
  onOpenSimulator,
  onOpenCreateTask,
  onSelectTask
}) => {
  const today = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked');
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.dueDate < today);

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart data
  const statusChartData = [
    { name: 'Completed', count: completedTasks },
    { name: 'In Progress', count: inProgressTasks },
    { name: 'Blocked', count: blockedTasks.length },
    { name: 'Ready', count: tasks.filter((t) => t.status === 'Ready').length }
  ];

  const priorityMap: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  tasks.forEach((t) => {
    if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
  });
  const priorityChartData = Object.entries(priorityMap).map(([name, count]) => ({ name, count }));

  // Upcoming deadlines
  const upcomingDeadlines = [...tasks]
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263044]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Project Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor dependencies, identify blockers and keep delivery on track.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => onOpenSimulator()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#162033] text-slate-200 border border-[#263044] text-xs font-medium transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Simulate Delay</span>
          </button>
          <button
            onClick={onOpenGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#162033] text-slate-200 border border-[#263044] text-xs font-medium transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Graph Canvas</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards (Section 3) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Tasks */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263044] relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Total Tasks</span>
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">{totalTasks}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 engineering streams</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#6366F1]/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263044] relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#34D399] tracking-tight">{completedTasks}</div>
          <p className="text-[11px] text-slate-400 mt-1">{completionPercent}% project progress</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#10B981]/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263044] relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wide uppercase">In Progress</span>
            <Clock className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#38BDF8] tracking-tight">{inProgressTasks}</div>
          <p className="text-[11px] text-slate-400 mt-1">Actively being delivered</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#38BDF8]/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Blocked */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#EF4444]/40 bg-[#EF4444]/[0.03] relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#F87171] mb-2">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Blocked</span>
            <AlertOctagon className="w-4 h-4 text-[#EF4444] animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#EF4444] tracking-tight">{blockedTasks.length}</div>
          <p className="text-[11px] text-[#F87171]/80 mt-1">Awaiting prerequisite completion</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#EF4444]/10 rounded-bl-full pointer-events-none" />
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263044] relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Overdue</span>
            <Calendar className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${overdueTasks.length > 0 ? 'text-[#F59E0B]' : 'text-slate-200'}`}>
            {overdueTasks.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requiring immediate reschedule</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/5 rounded-bl-full pointer-events-none" />
        </div>
      </div>

      {/* 3. Progress Bar & Timeline Section */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#263044]">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Project Milestone Velocity</span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({completedTasks} of {totalTasks} tasks complete)
            </span>
          </div>
          <span className="font-mono font-bold text-[#34D399]">{completionPercent}% Complete</span>
        </div>
        <div className="w-full bg-[#0D111B] h-2 rounded-full overflow-hidden border border-[#263044]/50">
          <div
            className="bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#10B981] h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
          <span>Project Kickoff: {project.startDate}</span>
          <span>Target Delivery: {project.targetDate}</span>
        </div>
      </div>

      {/* 4. ACTIVE BLOCKERS SECTION (Section 4 Redesign) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Active Blockers Requiring Immediate Attention
            </h2>
            <span className="px-2 py-0.2 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] text-xs font-mono font-bold">
              {blockedTasks.length}
            </span>
          </div>
          <button
            onClick={onOpenGraph}
            className="text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium transition-colors flex items-center gap-1"
          >
            <span>Inspect Graph Cascade</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {blockedTasks.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#111827] border border-[#263044] text-center text-xs text-slate-400">
            No active blockers detected. All prerequisites are satisfied.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {blockedTasks.map((task) => {
              const prereqs = task.blockerInfo?.blockingPrerequisites || [];
              const downstreamCount = task.blockerInfo?.dependentCount || 0;

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-[#111827] border border-[#263044] hover:border-[#EF4444]/50 hover:bg-[#141D30] transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Header: Priority & Due Date */}
                    <div className="flex items-center justify-between mb-2">
                      <PriorityBadge priority={task.priority} size="sm" />
                      <span className="text-[11px] font-mono text-slate-400">
                        Due {task.dueDate}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {task.title}
                    </h3>

                    {/* Assigned Member */}
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium truncate">{task.assignedTo}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#263044]/80">
                    {/* Blocking Prerequisite Callout */}
                    {prereqs.length > 0 && (
                      <div className="p-2 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] text-[#FCA5A5] flex items-start gap-1.5">
                        <span className="font-bold text-[#EF4444] shrink-0 mt-0.5">•</span>
                        <div className="truncate">
                          <span className="text-slate-400 text-[10px] block">Waiting on:</span>
                          <span className="font-semibold text-[#FEE2E2] truncate block">
                            {prereqs[0].title}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Downstream Impact & Action */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">
                        Affects: <strong className="text-white font-mono">{downstreamCount}</strong> downstream
                      </span>
                      <button
                        onClick={() => onSelectTask(task)}
                        className="text-[#22D3EE] hover:underline font-medium text-[11px]"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Charts & Upcoming Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044]">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
            Task Status Breakdown
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {statusChartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={STATUS_COLORS[entry.name] || '#64748B'}
                      stroke="#111827"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D111B',
                    borderColor: '#263044',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#263044] text-[11px]">
            {statusChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[item.name] }}
                />
                <span className="truncate">{item.name}:</span>
                <span className="font-mono font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044]">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
            Priority Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D111B',
                    borderColor: '#263044',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityChartData.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={PRIORITY_COLORS[entry.name] || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#263044] text-[11px]">
            {priorityChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[item.name] }}
                />
                <span>{item.name}:</span>
                <span className="font-mono font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044]">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Upcoming Deadlines</span>
            <span className="text-[10px] text-slate-400 lowercase font-normal font-mono">Next 7 days</span>
          </h3>
          <div className="space-y-2">
            {upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-2.5 rounded-lg bg-[#0D111B] border border-[#263044] hover:border-slate-500 transition-colors cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-white truncate">{task.title}</div>
                  <div className="text-[10px] text-slate-400">{task.assignedTo}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[11px] text-slate-300">{task.dueDate}</div>
                  <StatusBadge status={task.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
