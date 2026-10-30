/**
 * Builds adjacency lists for the graph:
 * - downstream: sourceTaskId -> [targetTaskId, ...] (what depends on this task)
 * - upstream: targetTaskId -> [sourceTaskId, ...] (prerequisites for this task)
 */
export function buildAdjacencyList(tasks, dependencies, candidateEdge) {
    const downstream = new Map();
    const upstream = new Map();
    const taskMap = new Map();
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
export function detectCycle(tasks, dependencies, candidateEdge) {
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
    const visited = new Map();
    const parent = new Map();
    for (const taskId of taskMap.keys()) {
        visited.set(taskId, 0);
        parent.set(taskId, null);
    }
    let cycleFound = null;
    function dfs(currentId, stack) {
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
            }
            else if (visited.get(neighborId) === 0) {
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
            const cycleTitles = cycleFound.map((id) => taskMap.get(id)?.title || id);
            return {
                hasCycle: true,
                cycleNodeIds: cycleFound,
                cyclePath: cycleTitles,
                message: `Circular dependency detected: ${cycleTitles.join(' → ')}`
            };
        }
    }
    for (const taskId of taskMap.keys()) {
        if (visited.get(taskId) === 0) {
            if (dfs(taskId, [])) {
                const cycleTitles = cycleFound.map((id) => taskMap.get(id)?.title || id);
                return {
                    hasCycle: true,
                    cycleNodeIds: cycleFound,
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
export function getDownstreamTaskIds(rootTaskId, tasks, dependencies) {
    const { downstream } = buildAdjacencyList(tasks, dependencies);
    const visited = new Set();
    const queue = [rootTaskId];
    while (queue.length > 0) {
        const current = queue.shift();
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
export function getUpstreamTaskIds(targetTaskId, tasks, dependencies) {
    const { upstream } = buildAdjacencyList(tasks, dependencies);
    const visited = new Set();
    const queue = [targetTaskId];
    while (queue.length > 0) {
        const current = queue.shift();
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
export function topologicalSort(tasks, dependencies) {
    const { downstream, upstream, taskMap } = buildAdjacencyList(tasks, dependencies);
    // Calculate in-degree (number of prerequisites)
    const inDegree = new Map();
    for (const taskId of taskMap.keys()) {
        inDegree.set(taskId, upstream.get(taskId)?.length || 0);
    }
    const queue = [];
    for (const [taskId, deg] of inDegree.entries()) {
        if (deg === 0) {
            queue.push(taskId);
        }
    }
    const sorted = [];
    while (queue.length > 0) {
        const node = queue.shift();
        sorted.push(node);
        const children = downstream.get(node) || [];
        for (const child of children) {
            const currentDeg = inDegree.get(child) - 1;
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
