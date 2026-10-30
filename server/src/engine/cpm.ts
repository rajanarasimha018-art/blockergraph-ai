import { Task, TaskDependency, CpmAnalysisResult, TaskCpmMetrics } from '../types/index.js';
import { buildAdjacencyList, topologicalSort } from './graph.js';

/**
 * Helper to add days to an ISO date string (YYYY-MM-DD).
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().split('T')[0];
}

/**
 * Calculates day difference between two ISO date strings (b - a).
 */
export function diffDays(aStr: string, bStr: string): number {
  const a = new Date(aStr);
  const b = new Date(bStr);
  const msDiff = b.getTime() - a.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Critical Path Method (CPM) Engine.
 * Implements standard Forward Pass (ES, EF) and Backward Pass (LS, LF) on DAG.
 * Calculates task slack and identifies critical path tasks.
 */
export function calculateCpm(
  tasks: Task[],
  dependencies: TaskDependency[],
  projectBaseStartDate?: string
): CpmAnalysisResult {
  if (tasks.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return {
      projectDurationDays: 0,
      criticalPathTaskIds: [],
      earliestProjectFinishDate: today,
      taskMetrics: {}
    };
  }

  // Base start date: earliest task start date or projectBaseStartDate or today
  const baseStart =
    projectBaseStartDate ||
    tasks.reduce((min, t) => (t.startDate < min ? t.startDate : min), tasks[0].startDate);

  const { downstream, upstream, taskMap } = buildAdjacencyList(tasks, dependencies);
  const lagMap = new Map<string, number>(); // `${source}->${target}` -> lagDays
  for (const dep of dependencies) {
    lagMap.set(`${dep.sourceTaskId}->${dep.targetTaskId}`, dep.lagDays || 0);
  }

  // 1. Get topological execution order
  let sortedIds: string[];
  try {
    sortedIds = topologicalSort(tasks, dependencies);
  } catch {
    // Fallback if cycle exists (should be handled before CPM, but safe fallback)
    sortedIds = tasks.map((t) => t.id);
  }

  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  // 2. FORWARD PASS: calculate Earliest Start (ES) and Earliest Finish (EF)
  for (const id of sortedIds) {
    const task = taskMap.get(id);
    const duration = task ? Math.max(1, task.duration || 1) : 1;
    const prerequisites = upstream.get(id) || [];

    // Optional: consider task's own declared start date offset from baseStart
    const taskStartOffset = Math.max(0, diffDays(baseStart, task?.startDate || baseStart));

    let maxPredecessorEf = taskStartOffset;
    for (const pId of prerequisites) {
      const pEf = ef.get(pId) ?? 0;
      const lag = lagMap.get(`${pId}->${id}`) || 0;
      if (pEf + lag > maxPredecessorEf) {
        maxPredecessorEf = pEf + lag;
      }
    }

    const taskEs = maxPredecessorEf;
    const taskEf = taskEs + duration;
    es.set(id, taskEs);
    ef.set(id, taskEf);
  }

  // Total project duration is the maximum EF among all tasks
  let projectDuration = 0;
  for (const finish of ef.values()) {
    if (finish > projectDuration) {
      projectDuration = finish;
    }
  }

  // 3. BACKWARD PASS: calculate Latest Finish (LF) and Latest Start (LS)
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  // Traverse in reverse topological order
  for (let i = sortedIds.length - 1; i >= 0; i--) {
    const id = sortedIds[i];
    const task = taskMap.get(id);
    const duration = task ? Math.max(1, task.duration || 1) : 1;
    const successors = downstream.get(id) || [];

    let minSuccessorLs = projectDuration;
    if (successors.length > 0) {
      for (const sId of successors) {
        const sLs = ls.get(sId) ?? projectDuration;
        const lag = lagMap.get(`${id}->${sId}`) || 0;
        if (sLs - lag < minSuccessorLs) {
          minSuccessorLs = sLs - lag;
        }
      }
    }

    const taskLf = minSuccessorLs;
    const taskLs = taskLf - duration;
    lf.set(id, taskLf);
    ls.set(id, taskLs);
  }

  // 4. Calculate Float/Slack and Critical Path
  const taskMetrics: Record<string, TaskCpmMetrics> = {};
  const criticalPathTaskIds: string[] = [];

  for (const id of tasks.map((t) => t.id)) {
    const taskEs = es.get(id) ?? 0;
    const taskEf = ef.get(id) ?? 0;
    const taskLs = ls.get(id) ?? taskEs;
    const taskLf = lf.get(id) ?? taskEf;

    // Slack is LS - ES (or LF - EF)
    const slack = Math.max(0, taskLs - taskEs);
    const isCritical = slack === 0;

    if (isCritical) {
      criticalPathTaskIds.push(id);
    }

    taskMetrics[id] = {
      es: taskEs,
      ef: taskEf,
      ls: taskLs,
      lf: taskLf,
      slack,
      isCritical,
      earliestStartDate: addDays(baseStart, taskEs),
      earliestFinishDate: addDays(baseStart, taskEf),
      latestStartDate: addDays(baseStart, taskLs),
      latestFinishDate: addDays(baseStart, taskLf)
    };
  }

  return {
    projectDurationDays: projectDuration,
    criticalPathTaskIds,
    earliestProjectFinishDate: addDays(baseStart, projectDuration),
    taskMetrics
  };
}
