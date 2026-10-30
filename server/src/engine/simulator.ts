import { Task, TaskDependency, DelaySimulationResult } from '../types/index.js';
import { calculateCpm, addDays } from './cpm.js';
import { getDownstreamTaskIds } from './graph.js';

/**
 * Simulates the impact of delaying a specific task by `delayDays`.
 * Performs exact topological CPM recalculation.
 */
export function simulateDelay(
  tasks: Task[],
  dependencies: TaskDependency[],
  delayedTaskId: string,
  delayDays: number,
  projectBaseStartDate?: string
): DelaySimulationResult {
  // 1. Calculate original schedule via CPM
  const originalCpm = calculateCpm(tasks, dependencies, projectBaseStartDate);

  // 2. Build simulated tasks: modify the delayed task
  // Delaying a task either extends its duration or shifts its start/finish by delayDays
  const simulatedTasks: Task[] = tasks.map((t) => {
    if (t.id === delayedTaskId) {
      return {
        ...t,
        duration: Math.max(1, t.duration + delayDays)
      };
    }
    return { ...t };
  });

  // 3. Recalculate CPM for the simulated schedule
  const simulatedCpm = calculateCpm(simulatedTasks, dependencies, projectBaseStartDate);

  // 4. Determine downstream affected tasks
  const downstreamIds = new Set(getDownstreamTaskIds(delayedTaskId, tasks, dependencies));

  // 5. Compare original vs simulated dates for all tasks
  const scheduleComparison: DelaySimulationResult['scheduleComparison'] = [];
  const tasksAtRisk: DelaySimulationResult['tasksAtRisk'] = [];
  const affectedIds: string[] = [];

  for (const task of tasks) {
    const origMetrics = originalCpm.taskMetrics[task.id];
    const simMetrics = simulatedCpm.taskMetrics[task.id];

    const origStart = origMetrics?.earliestStartDate || task.startDate;
    const origFinish = origMetrics?.earliestFinishDate || task.dueDate;
    const simStart = simMetrics?.earliestStartDate || origStart;
    const simFinish = simMetrics?.earliestFinishDate || origFinish;

    const deltaDays = (simMetrics?.ef ?? 0) - (origMetrics?.ef ?? 0);
    const isAffected = task.id === delayedTaskId || (downstreamIds.has(task.id) && deltaDays > 0);

    if (isAffected && task.id !== delayedTaskId) {
      affectedIds.push(task.id);
    }

    scheduleComparison.push({
      taskId: task.id,
      title: task.title,
      originalStart: origStart,
      originalFinish: origFinish,
      simulatedStart: simStart,
      simulatedFinish: simFinish,
      deltaDays,
      isAffected
    });

    // Check if task is at risk: exceeds user-defined dueDate or slack eroded to 0
    const exceedsDueDate = simFinish > task.dueDate;
    const slackRemaining = simMetrics?.slack ?? 0;

    if (isAffected && (exceedsDueDate || (origMetrics?.slack ?? 0) > 0 && slackRemaining === 0)) {
      tasksAtRisk.push({
        taskId: task.id,
        title: task.title,
        originalFinish: origFinish,
        simulatedFinish: simFinish,
        dueDate: task.dueDate,
        delayDays: deltaDays,
        exceedsDueDate,
        slackRemaining
      });
    }
  }

  const projectDelayDays = Math.max(
    0,
    simulatedCpm.projectDurationDays - originalCpm.projectDurationDays
  );

  const origCpSet = new Set(originalCpm.criticalPathTaskIds);
  const simCpSet = new Set(simulatedCpm.criticalPathTaskIds);
  const criticalPathChanged =
    origCpSet.size !== simCpSet.size ||
    [...origCpSet].some((id) => !simCpSet.has(id));

  return {
    delayedTaskId,
    delayDays,
    originalProjectDuration: originalCpm.projectDurationDays,
    simulatedProjectDuration: simulatedCpm.projectDurationDays,
    projectDelayDays,
    originalProjectEndDate: originalCpm.earliestProjectFinishDate,
    simulatedProjectEndDate: simulatedCpm.earliestProjectFinishDate,
    downstreamAffectedTaskIds: affectedIds,
    tasksAtRisk,
    criticalPathChanged,
    originalCriticalPath: originalCpm.criticalPathTaskIds,
    simulatedCriticalPath: simulatedCpm.criticalPathTaskIds,
    scheduleComparison
  };
}
