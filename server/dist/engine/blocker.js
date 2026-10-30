import { buildAdjacencyList, getDownstreamTaskIds } from './graph.js';
/**
 * Analyzes blocker status for all tasks in a project.
 * A task is blocked if it is not completed and has at least one prerequisite that is not 'Completed'.
 * Also computes downstream impact and tailored suggestions.
 */
export function analyzeBlockers(tasks, dependencies) {
    const { upstream, taskMap } = buildAdjacencyList(tasks, dependencies);
    const result = {};
    for (const task of tasks) {
        const prereqIds = upstream.get(task.id) || [];
        const blockingPrerequisites = [];
        // Check prerequisites
        for (const pId of prereqIds) {
            const pTask = taskMap.get(pId);
            if (pTask && pTask.status !== 'Completed') {
                blockingPrerequisites.push({
                    id: pTask.id,
                    title: pTask.title,
                    status: pTask.status,
                    assignedTo: pTask.assignedTo,
                    dueDate: pTask.dueDate
                });
            }
        }
        // A task is blocked if it is not completed AND has incomplete prerequisites
        const isBlocked = task.status !== 'Completed' && blockingPrerequisites.length > 0;
        const downstreamIds = getDownstreamTaskIds(task.id, tasks, dependencies);
        // Generate actionable suggestion
        let suggestedNextAction = 'All prerequisites are clear. Ready to begin or resume work.';
        if (task.status === 'Completed') {
            suggestedNextAction = 'Task is completed. Downstream prerequisites are satisfied.';
        }
        else if (isBlocked) {
            if (blockingPrerequisites.length === 1) {
                const bp = blockingPrerequisites[0];
                suggestedNextAction = `Accelerate completion of "${bp.title}" assigned to ${bp.assignedTo} (due ${bp.dueDate}) to unblock this task.`;
            }
            else {
                const earliestDuePrereq = [...blockingPrerequisites].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
                suggestedNextAction = `${blockingPrerequisites.length} prerequisite tasks pending. Prioritize "${earliestDuePrereq.title}" (${earliestDuePrereq.assignedTo}) to start unblocking the pipeline.`;
            }
        }
        else if (task.status === 'Ready') {
            suggestedNextAction = `Prerequisites met. Assignee ${task.assignedTo} can immediately begin progress.`;
        }
        else if (task.status === 'In Progress') {
            suggestedNextAction = `Work is actively underway (${task.progress}% complete). Keep momentum to avoid downstream delays.`;
        }
        result[task.id] = {
            taskId: task.id,
            isBlocked,
            blockingPrerequisites,
            dependentCount: downstreamIds.length,
            downstreamImpactIds: downstreamIds,
            suggestedNextAction
        };
    }
    return result;
}
/**
 * Computes updated status for a task based on its prerequisites.
 * If user didn't manually force a status, or if we want to auto-sync:
 * - If status is not Completed:
 *   - If any prerequisite is not Completed -> 'Blocked'
 *   - If all prerequisites are Completed -> (if previously Blocked, set to 'Ready')
 */
export function syncTaskBlockerStatus(task, tasks, dependencies) {
    if (task.status === 'Completed') {
        return task;
    }
    const { upstream, taskMap } = buildAdjacencyList(tasks, dependencies);
    const prereqIds = upstream.get(task.id) || [];
    const hasIncompletePrereq = prereqIds.some((pId) => {
        const p = taskMap.get(pId);
        return p && p.status !== 'Completed';
    });
    if (hasIncompletePrereq) {
        return { ...task, status: 'Blocked' };
    }
    else if (task.status === 'Blocked') {
        return { ...task, status: 'Ready' };
    }
    return task;
}
