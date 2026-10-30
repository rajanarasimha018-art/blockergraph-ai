import { calculateCpm } from './cpm.js';
import { analyzeBlockers } from './blocker.js';
import { buildAdjacencyList } from './graph.js';
/**
 * Generates explainable, high-value project intelligence insights
 * by analyzing critical path, blockers, overdue dates, and dependency bottlenecks.
 */
export function generateProjectInsights(tasks, dependencies, projectStartDate) {
    const insights = [];
    const today = new Date().toISOString().split('T')[0];
    if (tasks.length === 0) {
        return [
            {
                id: 'no-tasks',
                type: 'info',
                title: 'Project Ready for Tasks',
                description: 'Add initial tasks and dependencies to start graph analysis.',
                affectedTaskIds: []
            }
        ];
    }
    const cpm = calculateCpm(tasks, dependencies, projectStartDate);
    const blockers = analyzeBlockers(tasks, dependencies);
    const { downstream, upstream, taskMap } = buildAdjacencyList(tasks, dependencies);
    // 1. Critical Path Bottlenecks
    const criticalIncompleteTasks = tasks.filter((t) => cpm.criticalPathTaskIds.includes(t.id) && t.status !== 'Completed');
    if (criticalIncompleteTasks.length > 0) {
        const criticalTitles = criticalIncompleteTasks.map((t) => `"${t.title}"`).join(', ');
        insights.push({
            id: 'critical-path-focus',
            type: 'critical',
            title: 'Zero-Float Critical Path Vulnerability',
            description: `Tasks ${criticalTitles} have zero float/slack. Any delay on these tasks will directly delay project delivery by an equal amount of days.`,
            affectedTaskIds: criticalIncompleteTasks.map((t) => t.id),
            recommendedAction: `Allocate primary engineering resources and review blockers on ${criticalIncompleteTasks[0].title} immediately.`
        });
    }
    // 2. High-Impact Blocker Insight
    const blockedTasks = tasks.filter((t) => blockers[t.id]?.isBlocked);
    if (blockedTasks.length > 0) {
        // Find the prerequisite task that is blocking the most downstream tasks
        const prereqBlockCount = new Map();
        for (const bt of blockedTasks) {
            for (const bp of blockers[bt.id].blockingPrerequisites) {
                prereqBlockCount.set(bp.id, (prereqBlockCount.get(bp.id) || 0) + 1);
            }
        }
        let topBlockerId = null;
        let maxCount = 0;
        for (const [id, count] of prereqBlockCount.entries()) {
            if (count > maxCount) {
                maxCount = count;
                topBlockerId = id;
            }
        }
        if (topBlockerId && taskMap.has(topBlockerId)) {
            const topTask = taskMap.get(topBlockerId);
            const downstreamTitles = (downstream.get(topBlockerId) || [])
                .map((id) => `"${taskMap.get(id)?.title || id}"`)
                .slice(0, 3)
                .join(', ');
            insights.push({
                id: 'top-blocker-root-cause',
                type: 'warning',
                title: `Root Blocker: "${topTask.title}"`,
                description: `Task "${topTask.title}" (${topTask.assignedTo}) is currently blocking ${maxCount} task(s), including ${downstreamTitles}. Completing this will trigger an immediate unblocking cascade.`,
                affectedTaskIds: [topBlockerId, ...(downstream.get(topBlockerId) || [])],
                recommendedAction: `Focus QA/DevOps sign-off on "${topTask.title}" to unlock downstream engineering.`
            });
        }
    }
    // 3. Overdue tasks insight
    const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.dueDate < today);
    if (overdueTasks.length > 0) {
        const overdueTitles = overdueTasks.map((t) => `"${t.title}"`).slice(0, 3).join(', ');
        insights.push({
            id: 'overdue-schedule-alert',
            type: 'critical',
            title: `${overdueTasks.length} Overdue Task(s) Detected`,
            description: `Tasks including ${overdueTitles} have passed their due date without completion. This poses immediate schedule risk.`,
            affectedTaskIds: overdueTasks.map((t) => t.id),
            recommendedAction: 'Reschedule deadlines or reassign backlog resources to clear overdue backlog items.'
        });
    }
    // 4. Milestone Readiness (tasks with 0 remaining prerequisites)
    const readyTasks = tasks.filter((t) => t.status === 'Ready');
    if (readyTasks.length > 0) {
        insights.push({
            id: 'ready-to-execute',
            type: 'success',
            title: `${readyTasks.length} Task(s) Unblocked & Ready to Start`,
            description: `All prerequisite dependencies are 100% satisfied for tasks: ${readyTasks
                .map((t) => `"${t.title}"`)
                .slice(0, 3)
                .join(', ')}.`,
            affectedTaskIds: readyTasks.map((t) => t.id),
            recommendedAction: 'Engineers can commence work immediately with zero dependency friction.'
        });
    }
    // 5. Fan-out Complexity Warning
    const highFanOut = tasks.filter((t) => (downstream.get(t.id)?.length || 0) >= 3);
    if (highFanOut.length > 0) {
        const topFan = highFanOut[0];
        const fanCount = downstream.get(topFan.id)?.length || 0;
        insights.push({
            id: 'high-fanout-hub',
            type: 'info',
            title: `Architectural Hub: "${topFan.title}"`,
            description: `This task is a critical dependency hub with ${fanCount} direct downstream dependents. Quality regressions or delay here multiply downstream.`,
            affectedTaskIds: [topFan.id, ...(downstream.get(topFan.id) || [])],
            recommendedAction: 'Enforce peer code reviews and comprehensive integration tests for this hub.'
        });
    }
    return insights;
}
