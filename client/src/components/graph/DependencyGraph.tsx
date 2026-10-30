import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Task, TaskDependency } from '../../types';
import { TaskNode } from './TaskNode';
import { GraphLegend } from './GraphLegend';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { CycleAlertModal } from './CycleAlertModal';
import { api } from '../../api/client';
import {
  Sparkles,
  Plus,
  RefreshCw,
  GitBranch,
  AlertOctagon,
  TrendingDown,
  Maximize2
} from 'lucide-react';

interface DependencyGraphProps {
  projectId: string;
  tasks: Task[];
  dependencies: TaskDependency[];
  onRefresh: () => void;
  onSelectTaskToSimulate?: (task: Task) => void;
  onOpenCreateTaskModal: () => void;
  onOpenCreateDepModal: () => void;
  onEditTask: (task: Task) => void;
  activeSimulationResult?: any;
}

const nodeTypes = {
  taskNode: TaskNode
};

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  projectId,
  tasks,
  dependencies,
  onRefresh,
  onSelectTaskToSimulate,
  onOpenCreateTaskModal,
  onOpenCreateDepModal,
  onEditTask,
  activeSimulationResult
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);
  const [cycleModalState, setCycleModalState] = useState<{
    isOpen: boolean;
    cyclePath: string[];
    message: string;
    sourceTitle?: string;
    targetTitle?: string;
  }>({
    isOpen: false,
    cyclePath: [],
    message: ''
  });

  const criticalPathIds = useMemo(() => {
    return new Set(
      tasks.filter((t) => t.cpmMetrics?.isCritical).map((t) => t.id)
    );
  }, [tasks]);

  const initialNodes: Node[] = useMemo(() => {
    return tasks.map((t, idx) => {
      const isCritical = criticalPathIds.has(t.id);
      const isSimulatedAffected = activeSimulationResult?.downstreamAffectedTaskIds?.includes(t.id);
      const isSimulatedRisk = activeSimulationResult?.tasksAtRisk?.some((r: any) => r.taskId === t.id);

      return {
        id: t.id,
        type: 'taskNode',
        position: {
          x: t.positionX ?? (80 + (idx % 4) * 320),
          y: t.positionY ?? (80 + Math.floor(idx / 4) * 220)
        },
        data: {
          task: t,
          isCritical,
          isSimulatedAffected,
          isSimulatedRisk,
          onSelectTask: (task: Task) => setSelectedTask(task)
        }
      };
    });
  }, [tasks, criticalPathIds, activeSimulationResult]);

  const initialEdges: Edge[] = useMemo(() => {
    return dependencies.map((dep) => {
      const isCriticalEdge =
        criticalPathIds.has(dep.sourceTaskId) && criticalPathIds.has(dep.targetTaskId);

      const targetTask = tasks.find((t) => t.id === dep.targetTaskId);
      const isBlockedEdge = targetTask?.status === 'Blocked';

      let strokeColor = '#334155';
      let animated = false;
      let strokeWidth = 2;
      let className = '';

      if (isCriticalEdge) {
        strokeColor = '#F59E0B';
        strokeWidth = 3;
        className = 'critical-edge';
      } else if (isBlockedEdge) {
        strokeColor = '#EF4444';
        animated = true;
        className = 'blocked-edge';
      }

      return {
        id: dep.id,
        source: dep.sourceTaskId,
        target: dep.targetTaskId,
        type: 'smoothstep',
        animated,
        style: {
          stroke: strokeColor,
          strokeWidth
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14
        },
        className
      };
    });
  }, [dependencies, criticalPathIds, tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeDragStop = useCallback(
    async (_: any, node: Node) => {
      try {
        await api.tasks.updatePosition(projectId, node.id, Math.round(node.position.x), Math.round(node.position.y));
      } catch (err) {
        console.error('Failed to persist node position:', err);
      }
    },
    [projectId]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const sourceTask = tasks.find((t) => t.id === connection.source);
      const targetTask = tasks.find((t) => t.id === connection.target);

      if (connection.source === connection.target) {
        setCycleModalState({
          isOpen: true,
          cyclePath: [sourceTask?.title || connection.source, sourceTask?.title || connection.source],
          message: `Self-dependency rejected: Task "${sourceTask?.title}" cannot depend on itself.`,
          sourceTitle: sourceTask?.title,
          targetTitle: targetTask?.title
        });
        return;
      }

      try {
        await api.dependencies.validate(projectId, connection.source, connection.target);

        await api.dependencies.create(projectId, {
          sourceTaskId: connection.source,
          targetTaskId: connection.target,
          type: 'finish_to_start',
          lagDays: 0
        });

        onRefresh();
      } catch (err: any) {
        console.error('Connection validation error:', err);
        const data = err.data || {};
        setCycleModalState({
          isOpen: true,
          cyclePath: data.cyclePath || [sourceTask?.title || 'Task A', targetTask?.title || 'Task B', sourceTask?.title || 'Task A'],
          message: err.message || 'Creating this dependency creates a circular dependency loop.',
          sourceTitle: sourceTask?.title,
          targetTitle: targetTask?.title
        });
      }
    },
    [projectId, tasks, onRefresh]
  );

  const onEdgeClick = useCallback(
    async (_: any, edge: Edge) => {
      if (window.confirm('Do you want to remove this dependency link?')) {
        try {
          await api.dependencies.delete(projectId, edge.id);
          onRefresh();
        } catch (err) {
          console.error('Failed to delete dependency:', err);
        }
      }
    },
    [projectId, onRefresh]
  );

  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    try {
      await api.tasks.update(projectId, taskId, { status });
      onRefresh();
      const updated = tasks.find((t) => t.id === taskId);
      if (updated) setSelectedTask({ ...updated, status });
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task and all associated dependencies?')) {
      try {
        await api.tasks.delete(projectId, taskId);
        setSelectedTask(null);
        onRefresh();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-[#263044] bg-[#080B12] shadow-xl">
      {/* Top Floating Linear Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-[#0D111B]/95 border border-[#263044] shadow-lg text-xs">
        <button
          onClick={onOpenCreateTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>

        <button
          onClick={onOpenCreateDepModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111827] hover:bg-[#1A2333] text-slate-200 border border-[#263044] font-medium transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Link Dependency</span>
        </button>

        <div className="h-4 w-px bg-[#263044] mx-1" />

        <button
          onClick={() => setShowCriticalPathOnly(!showCriticalPathOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium transition-all ${
            showCriticalPathOnly
              ? 'bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/50'
              : 'bg-[#111827] hover:bg-[#1A2333] text-slate-300 border-[#263044]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Critical Path</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] font-mono text-[11px]">
          <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
          <span>{tasks.filter((t) => t.status === 'Blocked').length} Blocked</span>
        </div>

        <div className="h-4 w-px bg-[#263044] mx-1" />

        <button
          onClick={onRefresh}
          title="Refresh Graph"
          className="p-1.5 rounded-md bg-[#111827] hover:bg-[#1A2333] text-slate-400 hover:text-white border border-[#263044] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Simulated Delay Banner (if active) */}
      {activeSimulationResult && (
        <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-xs text-[#FCD34D] flex items-center gap-2 shadow-lg">
          <TrendingDown className="w-4 h-4 text-[#F59E0B]" />
          <span>
            Simulated: <strong>+{activeSimulationResult.delayDays}d</strong> on "
            {tasks.find((t) => t.id === activeSimulationResult.delayedTaskId)?.title}" (
            {activeSimulationResult.downstreamAffectedTaskIds.length} tasks shifted)
          </span>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
        <Controls className="!bg-[#0D111B] !border !border-[#263044] !rounded-lg" />
        <MiniMap
          nodeColor={(node: any) => {
            const task = node.data?.task;
            if (task?.status === 'Blocked') return '#EF4444';
            if (task?.status === 'Ready') return '#10B981';
            if (task?.status === 'In Progress') return '#38BDF8';
            if (task?.status === 'Completed') return '#64748B';
            return '#1E293B';
          }}
          maskColor="rgba(8, 11, 18, 0.85)"
          className="!bg-[#0D111B] !border !border-[#263044] !rounded-lg"
        />
      </ReactFlow>

      {/* Graph Legend */}
      <GraphLegend />

      {/* Task Details Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
        onSimulateDelay={(t) => {
          setSelectedTask(null);
          onSelectTaskToSimulate?.(t);
        }}
        onEditTask={(t) => {
          setSelectedTask(null);
          onEditTask(t);
        }}
        onDeleteTask={handleDeleteTask}
        allTasks={tasks}
        dependencies={dependencies}
      />

      {/* Cycle Detection Modal */}
      <CycleAlertModal
        isOpen={cycleModalState.isOpen}
        onClose={() => setCycleModalState((prev) => ({ ...prev, isOpen: false }))}
        cyclePath={cycleModalState.cyclePath}
        message={cycleModalState.message}
        sourceTaskTitle={cycleModalState.sourceTitle}
        targetTaskTitle={cycleModalState.targetTitle}
      />
    </div>
  );
};
