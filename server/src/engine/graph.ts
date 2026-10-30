import { Task, TaskDependency, CycleDetectionResult } from '../types/index.js';

/**
 * Builds adjacency lists for the graph:
 * - downstream: sourceTaskId -> [targetTaskId, ...] (what depends on this task)
 * - upstream: targetTaskId -> [sourceTaskId, ...] (prerequisites for this task)
 */
export function buildAdjacencyList(
  tasks: Task[],
  dependencies: TaskDependency[],
  candidateEdge?: { sourceTaskId: string; targetTaskId: string }
): {
  downstream: Map<string, string[]>;
  upstream: Map<string, string[]>;
  taskMap: Map<string, Task>;
} {
  const downstream = new Map<string, string[]>();
  const upstream = new Map<string, string[]>();
  const taskMap = new Map<string, Task>();

  for (const task of tasks) {
    downstream.set(task.id, []);
    upstream.set(task.id, []);
    taskMap.set(task.id, task);
  }

  for (const dep of dependencies) {
    if (taskMap.has(dep.sourceTaskId) && taskMap.has(dep.targetTaskId)) {
      downstream.get(dep.sourceTaskId)?.push(dep.targetTaskId);
      upstream.get(dep.targetTaskId)?.push(dep.sourceTaskId);
    }
  }

  if (candidateEdge) {
    if (taskMap.has(candidateEdge.sourceTaskId) && taskMap.has(candidateEdge.targetTaskId)) {
      downstream.get(candidateEdge.sourceTaskId)?.push(candidateEdge.targetTaskId);
      upstream.get(candidateEdge.targetTaskId)?.push(candidateEdge.sourceTaskId);
    }
  }

  return { downstream, upstream, taskMap };
}

/**
 * Detects circular dependencies using DFS cycle detection.
 * If candidateEdge is provided, tests if adding this candidate edge would create a cycle.
 * Returns the cycle path with task titles, e.g. "Task A -> Task B -> Task C -> Task A".
 */
export function detectCycle(
  tasks: Task[],
  dependencies: TaskDependency[],
  candidateEdge?: { sourceTaskId: string; targetTaskId: string }
): CycleDetectionResult {
  // 1. Check self-dependency
  if (candidateEdge && candidateEdge.sourceTaskId === candidateEdge.targetTaskId) {
    const task = tasks.find((t) => t.id === candidateEdge.sourceTaskId);
    const taskName = task ? `"${task.title}"` : candidateEdge.sourceTaskId;
    return {
      hasCycle: true,
      cycleNodeIds: [candidateEdge.sourceTaskId, candidateEdge.targetTaskId],
      cyclePath: [taskName, taskName],
      message: `Self-dependency detected: Task ${taskName} cannot depend on itself.`
    };
  }

  const { downstream, taskMap } = buildAdjacencyList(tasks, dependencies, candidateEdge);

  // Visited states: 0 = unvisited, 1 = visiting (in recursion stack), 2 = visited
  const visited = new Map<string, number>();
  const parent = new Map<string, string | null>();

  for (const taskId of taskMap.keys()) {
    visited.set(taskId, 0);
    parent.set(taskId, null);
  }

  let cycleFound: string[] | null = null;

  function dfs(currentId: string, stack: string[]): boolean {
    visited.set(currentId, 1);
    stack.push(currentId);

    const neighbors = downstream.get(currentId) || [];
    for (const neighborId of neighbors) {
      if (visited.get(neighborId) === 1) {
        // Cycle detected! Extract cycle path
        const cycleStartIndex = stack.indexOf(neighborId);
        if (cycleStartIndex !== -1) {
          cycleFound = stack.slice(cycleStartIndex).concat(neighborId);
          return true;
        }
      } else if (visited.get(neighborId) === 0) {
        parent.set(neighborId, currentId);
        if (dfs(neighborId, stack)) {
          return true;
        }
      }
    }

    visited.set(currentId, 2);
    stack.pop();
    return false;
  }

  // If candidateEdge was provided, prioritizing starting from candidateEdge.sourceTaskId or targetTaskId
  if (candidateEdge && taskMap.has(candidateEdge.targetTaskId)) {
    if (dfs(candidateEdge.targetTaskId, [])) {
      const cycleTitles = cycleFound!.map((id) => taskMap.get(id)?.title || id);
      return {
        hasCycle: true,
        cycleNodeIds: cycleFound!,
        cyclePath: cycleTitles,
        message: `Circular dependency detected: ${cycleTitles.join(' → ')}`
      };
    }
  }

  for (const taskId of taskMap.keys()) {
    if (visited.get(taskId) === 0) {
      if (dfs(taskId, [])) {
        const cycleTitles = cycleFound!.map((id) => taskMap.get(id)?.title || id);
        return {
          hasCycle: true,
          cycleNodeIds: cycleFound!,
          cyclePath: cycleTitles,
          message: `Circular dependency detected: ${cycleTitles.join(' → ')}`
        };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Returns all downstream tasks (transitive dependents) affected by a task.
 */
export function getDownstreamTaskIds(
  rootTaskId: string,
  tasks: Task[],
  dependencies: TaskDependency[]
): string[] {
  const { downstream } = buildAdjacencyList(tasks, dependencies);
  const visited = new Set<string>();
  const queue: string[] = [rootTaskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = downstream.get(current) || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push(n);
      }
    }
  }

  return Array.from(visited);
}

/**
 * Returns all upstream tasks (transitive prerequisites) that a task depends on.
 */
export function getUpstreamTaskIds(
  targetTaskId: string,
  tasks: Task[],
  dependencies: TaskDependency[]
): string[] {
  const { upstream } = buildAdjacencyList(tasks, dependencies);
  const visited = new Set<string>();
  const queue: string[] = [targetTaskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const prerequisites = upstream.get(current) || [];
    for (const p of prerequisites) {
      if (!visited.has(p)) {
        visited.add(p);
        queue.push(p);
      }
    }
  }

  return Array.from(visited);
}

/**
 * Performs Topological Sorting of tasks.
 * Returns task IDs in valid execution order. Throws error if graph has cycle.
 */
export function topologicalSort(tasks: Task[], dependencies: TaskDependency[]): string[] {
  const { downstream, upstream, taskMap } = buildAdjacencyList(tasks, dependencies);

  // Calculate in-degree (number of prerequisites)
  const inDegree = new Map<string, number>();
  for (const taskId of taskMap.keys()) {
    inDegree.set(taskId, upstream.get(taskId)?.length || 0);
  }

  const queue: string[] = [];
  for (const [taskId, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(taskId);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);

    const children = downstream.get(node) || [];
    for (const child of children) {
      const currentDeg = inDegree.get(child)! - 1;
      inDegree.set(child, currentDeg);
      if (currentDeg === 0) {
        queue.push(child);
      }
    }
  }

  if (sorted.length !== tasks.length) {
    throw new Error('Topological sort failed: graph contains a circular dependency.');
  }

  return sorted;
}
