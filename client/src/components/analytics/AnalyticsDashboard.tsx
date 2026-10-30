import React, { useState, useEffect } from 'react';
import { AnalyticsData, Project } from '../../types';
import { api } from '../../api/client';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  ShieldAlert,
  Zap,
  Activity,
  HeartPulse
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../ui/Badge';

interface AnalyticsDashboardProps {
  projectId: string;
  project: Project;
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

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ projectId, project }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.analytics.get(projectId);
        if (mounted) setData(res);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Computing topological analytics & CPM schedule float...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-[#EF4444] bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20 text-xs">
        {error || 'Unable to load analytics'}
      </div>
    );
  }

  const { summary, charts, criticalPathTasks, blockedTasksList, insights } = data;

  // Project Health Score (0-100) based on blockers and completion
  const healthScore = Math.max(
    10,
    Math.round(100 - (summary.blockedTasks * 6) - (summary.overdueTasks * 10) + (summary.completionRate * 0.3))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Project Health Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 p-5 rounded-xl bg-[#111827] border border-[#263044] flex flex-col justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Project Analytics & CPM Intelligence</h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic graph metrics, zero-float schedule vulnerability, and resource workload distribution.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-[#263044]/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Duration</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">{summary.projectDurationDays} working days</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Critical Tasks</span>
              <div className="text-sm font-bold font-mono text-[#F59E0B] mt-0.5">{summary.criticalPathLength} tasks (0 float)</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Completion</span>
              <div className="text-sm font-bold font-mono text-[#34D399] mt-0.5">{summary.completionRate}%</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Projected End</span>
              <div className="text-sm font-bold font-mono text-[#22D3EE] mt-0.5">{summary.earliestProjectFinishDate}</div>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Project Health Score</span>
            <HeartPulse className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {healthScore}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-[#0D111B] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  healthScore > 75 ? 'bg-[#10B981]' : healthScore > 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400">
            {healthScore > 70 ? 'Delivery confidence stable' : 'Blockers require priority intervention'}
          </span>
        </div>
      </div>

      {/* 2. Project Intelligence Insights (Explainable AI Engine) */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#818CF8]" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Deterministic Project Intelligence Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight) => {
            const borderClasses = {
              critical: 'border-[#EF4444]/40 bg-[#EF4444]/[0.04]',
              warning: 'border-[#F59E0B]/40 bg-[#F59E0B]/[0.04]',
              info: 'border-[#38BDF8]/40 bg-[#38BDF8]/[0.04]',
              success: 'border-[#10B981]/40 bg-[#10B981]/[0.04]'
            }[insight.type];

            const icon = {
              critical: <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />,
              warning: <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />,
              info: <Zap className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />,
              success: <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            }[insight.type];

            return (
              <div
                key={insight.id}
                className={`p-3.5 rounded-lg border ${borderClasses} space-y-1.5 text-xs`}
              >
                <div className="flex items-start gap-2">
                  {icon}
                  <div>
                    <h4 className="font-bold text-white text-xs">{insight.title}</h4>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
                {insight.recommendedAction && (
                  <div className="pt-1.5 border-t border-[#263044]/80 text-[10px] text-slate-400">
                    <strong className="text-white">Action:</strong> {insight.recommendedAction}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recharts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Task Status Breakdown
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {charts.statusDistribution.map((entry, idx) => (
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
                <Legend
                  formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Priority Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.priorityDistribution}>
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
                  {charts.priorityDistribution.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={PRIORITY_COLORS[entry.name] || '#6366F1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Critical Path Tasks Breakdown Table */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-white">
              Critical Path Tasks (Zero Float Chain)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#FCD34D] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded border border-[#F59E0B]/30">
            {criticalPathTasks.length} Sequential Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#263044] text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-[#0D111B]">
                <th className="py-2.5 pl-3">Task Title</th>
                <th className="py-2.5">Assignee</th>
                <th className="py-2.5">Priority</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Duration</th>
                <th className="py-2.5">Float (Slack)</th>
                <th className="py-2.5 pr-3">Schedule Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263044]/60 font-mono">
              {criticalPathTasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#162033] transition-colors">
                  <td className="py-2.5 pl-3 font-sans font-semibold text-white max-w-[220px] truncate">
                    {t.title}
                  </td>
                  <td className="py-2.5 font-sans text-slate-300">{t.assignedTo}</td>
                  <td className="py-2.5 font-sans">
                    <PriorityBadge priority={t.priority} size="sm" />
                  </td>
                  <td className="py-2.5 font-sans">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-2.5 text-slate-300">{t.duration}d</td>
                  <td className="py-2.5 text-[#F59E0B] font-bold">0d (Zero Float)</td>
                  <td className="py-2.5 pr-3 text-slate-400 text-[11px]">
                    {t.startDate} → {t.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
