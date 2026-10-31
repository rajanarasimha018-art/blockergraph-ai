import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskDependency, DelaySimulationResult } from '../../types';
import { api } from '../../api/client';
import {
  TrendingDown,
  AlertOctagon,
  Layers,
  Play,
  RotateCcw
} from 'lucide-react';

interface DelaySimulatorProps {
  projectId: string;
  tasks: Task[];
  dependencies?: TaskDependency[];
  preselectedTask?: Task | null;
  onApplySimulationToGraph?: (result: DelaySimulationResult | null) => void;
}

export const DelaySimulator: React.FC<DelaySimulatorProps> = ({
  projectId,
  tasks,
  dependencies: _dependencies,
  preselectedTask,
  onApplySimulationToGraph
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    preselectedTask ? preselectedTask.id : (tasks[3]?.id || tasks[0]?.id || '')
  );
  const [delayDays, setDelayDays] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DelaySimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedTask) {
      setSelectedTaskId(preselectedTask.id);
    }
  }, [preselectedTask]);

  const handleRunSimulation = useCallback(async () => {
    if (!selectedTaskId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.simulation.simulate(projectId, selectedTaskId, delayDays);
      setResult(data.simulation);
      onApplySimulationToGraph?.(data.simulation);
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedTaskId, delayDays, onApplySimulationToGraph]);

  useEffect(() => {
    if (selectedTaskId) {
      handleRunSimulation();
    }
  }, [selectedTaskId, delayDays, handleRunSimulation]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Control Panel Card */}
      <div className="p-6 rounded-xl bg-[#111827] border border-[#263044] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#263044]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B]">
                <TrendingDown className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Delay Impact Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Topological critical path recalculation: evaluate cascading slippage, downstream risk, and projected finish dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Recalculating...' : 'Run Simulation'}</span>
            </button>
            <button
              onClick={() => {
                setResult(null);
                onApplySimulationToGraph?.(null);
              }}
              className="p-2 rounded-lg bg-[#0D111B] hover:bg-[#1A2333] text-slate-400 hover:text-white border border-[#263044] transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] text-xs">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Task Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Upstream Task to Delay
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0D111B] border border-[#263044] text-white text-xs focus:outline-none focus:border-[#6366F1]"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.assignedTo}) — {t.duration}d duration [{t.status}]
                </option>
              ))}
            </select>
            {selectedTask && (
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-mono">
                <span>Priority: {selectedTask.priority}</span>
                <span>•</span>
                <span>Due: {selectedTask.dueDate}</span>
                <span>•</span>
                <span>Available Float: {selectedTask.cpmMetrics?.slack ?? 0}d</span>
              </div>
            )}
          </div>

          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Simulated Delay Duration
              </label>
              <span className="px-2.5 py-0.5 rounded bg-[#6366F1]/15 text-[#A5B4FC] font-mono font-bold text-xs border border-[#6366F1]/30">
                +{delayDays} {delayDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="21"
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#0D111B] rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>+1 Day</span>
              <span>+7 Days</span>
              <span>+14 Days</span>
              <span>+21 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Simulation Results Metrics */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263044]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Project Delivery Delay
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono ${
                  result.projectDelayDays > 0 ? 'text-[#EF4444]' : 'text-[#34D399]'
                }`}
              >
                +{result.projectDelayDays}d
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({result.originalProjectDuration}d → {result.simulatedProjectDuration}d)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {result.projectDelayDays > 0
                ? 'Directly pushes final delivery deadline later.'
                : 'Absorbed by task float; delivery date intact.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#263044]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Simulated Finish Date
            </span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {result.simulatedProjectEndDate}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Original: {result.originalProjectEndDate}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#263044]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Downstream Shifted
            </span>
            <div className="text-2xl font-bold font-mono text-[#F59E0B]">
              {result.downstreamAffectedTaskIds.length} tasks
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Dependencies forced to delay their start
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#263044]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Tasks At Risk
            </span>
            <div
              className={`text-2xl font-bold font-mono ${
                result.tasksAtRisk.length > 0 ? 'text-[#EF4444]' : 'text-[#34D399]'
              }`}
            >
              {result.tasksAtRisk.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Exceeding defined hard deadlines
            </p>
          </div>
        </div>
      )}

      {/* 3. Tasks at Risk Alert Box */}
      {result && result.tasksAtRisk.length > 0 && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#EF4444]" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Critical Risk: {result.tasksAtRisk.length} Downstream Tasks Exceeding Due Dates
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.tasksAtRisk.map((risk) => (
              <div
                key={risk.taskId}
                className="p-3 rounded-lg bg-[#111827] border border-[#EF4444]/30 text-xs space-y-1"
              >
                <div className="font-semibold text-white truncate">{risk.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Target Due: <span className="text-slate-200">{risk.dueDate}</span>
                </div>
                <div className="text-[11px] text-[#F87171] font-mono font-bold">
                  Simulated Finish: {risk.simulatedFinish} (+{risk.delayDays}d slippage)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Side-by-Side Comparison Table */}
      {result && (
        <div className="p-5 rounded-xl bg-[#111827] border border-[#263044] shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6366F1]" />
              <h3 className="text-sm font-bold text-white">Before & After Schedule Comparison</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {result.scheduleComparison.length} total tasks compared
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#263044] text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-[#0D111B]">
                  <th className="py-2.5 pl-3">Task Title</th>
                  <th className="py-2.5">Original Window</th>
                  <th className="py-2.5">Simulated Window</th>
                  <th className="py-2.5">Schedule Delta</th>
                  <th className="py-2.5 pr-3">Status Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263044]/60">
                {result.scheduleComparison.map((item) => (
                  <tr
                    key={item.taskId}
                    className={`hover:bg-[#162033] transition-colors ${
                      item.taskId === selectedTaskId
                        ? 'bg-[#6366F1]/10 font-medium'
                        : item.isAffected
                        ? 'bg-[#F59E0B]/5'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 pl-3 max-w-[240px] truncate">
                      <span className="text-white font-medium">{item.title}</span>
                      {item.taskId === selectedTaskId && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-[#6366F1]/20 text-[#A5B4FC] text-[9px] uppercase font-bold">
                          Delay Origin
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 font-mono text-slate-400">
                      {item.originalStart} → {item.originalFinish}
                    </td>
                    <td className="py-2.5 font-mono text-slate-200">
                      {item.simulatedStart} → {item.simulatedFinish}
                    </td>
                    <td className="py-2.5 font-mono font-semibold">
                      {item.deltaDays > 0 ? (
                        <span className="text-[#EF4444]">+{item.deltaDays}d</span>
                      ) : (
                        <span className="text-slate-500">0d</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {item.taskId === selectedTaskId ? (
                        <span className="px-2 py-0.5 rounded bg-[#6366F1]/20 text-[#A5B4FC] text-[10px] font-semibold border border-[#6366F1]/30">
                          Origin (+{delayDays}d)
                        </span>
                      ) : item.isAffected ? (
                        <span className="px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#FCD34D] text-[10px] font-semibold border border-[#F59E0B]/30">
                          Cascaded Shift
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#0D111B] text-slate-400 text-[10px] border border-[#263044]">
                          Unaltered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
