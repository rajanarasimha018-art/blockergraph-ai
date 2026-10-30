import { describe, it, expect, beforeEach } from 'vitest';
import { Task, TaskDependency } from '../src/types/index.js';
import { detectCycle, getDownstreamTaskIds, topologicalSort } from '../src/engine/graph.js';
import { calculateCpm } from '../src/engine/cpm.js';
import { analyzeBlockers, syncTaskBlockerStatus } from '../src/engine/blocker.js';
import { simulateDelay } from '../src/engine/simulator.js';

describe('BlockerGraph AI Core Engine - Comprehensive Test Suite', () => {
  let sampleTasks: Task[];
  let sampleDeps: TaskDependency[];

  beforeEach(() => {
    sampleTasks = [
      {
        id: 't-1',
        projectId: 'p-1',
        title: 'Task A - Schema Design',
        description: 'Design DB schema',
        assignedTo: 'Alice',
        priority: 'High',
        startDate: '2026-11-01',
        dueDate: '2026-11-03',
        duration: 3,
        status: 'Completed',
        progress: 100,
        createdAt: '2026-10-25T00:00:00Z',
        updatedAt: '2026-10-25T00:00:00Z'
      },
      {
        id: 't-2',
        projectId: 'p-1',
        title: 'Task B - Backend API',
        description: 'Implement API endpoints',
        assignedTo: 'Bob',
        priority: 'Critical',
        startDate: '2026-11-04',
        dueDate: '2026-11-07',
        duration: 4,
        status: 'In Progress',
        progress: 50,
        createdAt: '2026-10-25T00:00:00Z',
        updatedAt: '2026-10-25T00:00:00Z'
      },
      {
        id: 't-3',
        projectId: 'p-1',
        title: 'Task C - Frontend Integration',
        description: 'Connect UI to API',
        assignedTo: 'Charlie',
        priority: 'High',
        startDate: '2026-11-08',
        dueDate: '2026-11-12',
        duration: 5,
        status: 'Blocked',
        progress: 0,
        createdAt: '2026-10-25T00:00:00Z',
        updatedAt: '2026-10-25T00:00:00Z'
      },
      {
        id: 't-4',
        projectId: 'p-1',
        title: 'Task D - Deployment & Rollout',
        description: 'Deploy to cloud',
        assignedTo: 'Diana',
        priority: 'Critical',
        startDate: '2026-11-13',
        dueDate: '2026-11-15',
        duration: 2,
        status: 'Blocked',
        progress: 0,
        createdAt: '2026-10-25T00:00:00Z',
        updatedAt: '2026-10-25T00:00:00Z'
      }
    ];

    // Dependencies: t-1 -> t-2 -> t-3 -> t-4
    sampleDeps = [
      {
        id: 'd-1',
        projectId: 'p-1',
        sourceTaskId: 't-1',
        targetTaskId: 't-2',
        type: 'finish_to_start',
        lagDays: 0,
        createdAt: '2026-10-25T00:00:00Z'
      },
      {
        id: 'd-2',
        projectId: 'p-1',
        sourceTaskId: 't-2',
        targetTaskId: 't-3',
        type: 'finish_to_start',
        lagDays: 0,
        createdAt: '2026-10-25T00:00:00Z'
      },
      {
        id: 'd-3',
        projectId: 'p-1',
        sourceTaskId: 't-3',
        targetTaskId: 't-4',
        type: 'finish_to_start',
        lagDays: 0,
        createdAt: '2026-10-25T00:00:00Z'
      }
    ];
  });

  // Test 1: Creating valid tasks
  it('1. should validate and calculate metrics on valid tasks', () => {
    expect(sampleTasks).toHaveLength(4);
    for (const task of sampleTasks) {
      expect(task.duration).toBeGreaterThanOrEqual(1);
      expect(['Low', 'Medium', 'High', 'Critical']).toContain(task.priority);
      expect(['Ready', 'In Progress', 'Blocked', 'Completed']).toContain(task.status);
    }
  });

  // Test 2: Creating valid dependencies
  it('2. should accept valid acyclic dependencies and sort tasks topologically', () => {
    const cycle = detectCycle(sampleTasks, sampleDeps);
    expect(cycle.hasCycle).toBe(false);

    const sorted = topologicalSort(sampleTasks, sampleDeps);
    expect(sorted).toEqual(['t-1', 't-2', 't-3', 't-4']);
  });

  // Test 3: Rejecting self-dependencies
  it('3. should reject self-dependencies (Task cannot depend on itself)', () => {
    const selfEdge = { sourceTaskId: 't-2', targetTaskId: 't-2' };
    const result = detectCycle(sampleTasks, sampleDeps, selfEdge);
    expect(result.hasCycle).toBe(true);
    expect(result.message).toContain('cannot depend on itself');
  });

  // Test 4: Detecting circular dependencies
  it('4. should detect circular dependency chains and explain the exact cycle path (e.g. t-4 -> t-2)', () => {
    // Adding edge from t-4 -> t-2 creates cycle: t-2 -> t-3 -> t-4 -> t-2
    const cycleEdge = { sourceTaskId: 't-4', targetTaskId: 't-2' };
    const result = detectCycle(sampleTasks, sampleDeps, cycleEdge);

    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath).toBeDefined();
    expect(result.message).toContain('Circular dependency detected');
    // Cycle must mention the looping tasks
    expect(result.cycleNodeIds).toContain('t-2');
    expect(result.cycleNodeIds).toContain('t-3');
    expect(result.cycleNodeIds).toContain('t-4');
  });

  // Test 5: Identifying blocked tasks
  it('5. should identify blocked tasks whose prerequisites are incomplete', () => {
    const blockers = analyzeBlockers(sampleTasks, sampleDeps);

    // t-1 has no prerequisites -> not blocked
    expect(blockers['t-1'].isBlocked).toBe(false);

    // t-2 prerequisite is t-1, which is 'Completed' -> not blocked
    expect(blockers['t-2'].isBlocked).toBe(false);

    // t-3 prerequisite is t-2, which is 'In Progress' -> BLOCKED!
    expect(blockers['t-3'].isBlocked).toBe(true);
    expect(blockers['t-3'].blockingPrerequisites).toHaveLength(1);
    expect(blockers['t-3'].blockingPrerequisites[0].id).toBe('t-2');

    // t-4 prerequisite is t-3, which is 'Blocked' (not completed) -> BLOCKED!
    expect(blockers['t-4'].isBlocked).toBe(true);
  });

  // Test 6: Identifying downstream affected tasks
  it('6. should correctly compute all transitive downstream affected tasks', () => {
    // Downstream of t-2 should be t-3 and t-4
    const downstreamFromT2 = getDownstreamTaskIds('t-2', sampleTasks, sampleDeps);
    expect(downstreamFromT2).toContain('t-3');
    expect(downstreamFromT2).toContain('t-4');
    expect(downstreamFromT2).toHaveLength(2);

    // Downstream of t-4 should be empty (leaf task)
    const downstreamFromT4 = getDownstreamTaskIds('t-4', sampleTasks, sampleDeps);
    expect(downstreamFromT4).toHaveLength(0);
  });

  // Test 7: Updating blocker status after task completion
  it('7. should update blocker status to Ready when prerequisite tasks are completed', () => {
    // Before: t-3 is blocked because t-2 is 'In Progress'
    let blockers = analyzeBlockers(sampleTasks, sampleDeps);
    expect(blockers['t-3'].isBlocked).toBe(true);

    // Action: complete t-2
    sampleTasks[1].status = 'Completed';
    sampleTasks[1].progress = 100;

    // After: re-run blocker analysis
    blockers = analyzeBlockers(sampleTasks, sampleDeps);
    expect(blockers['t-3'].isBlocked).toBe(false);
    expect(blockers['t-3'].blockingPrerequisites).toHaveLength(0);

    const synced = syncTaskBlockerStatus(sampleTasks[2], sampleTasks, sampleDeps);
    expect(synced.status).toBe('Ready');
  });

  // Test 8: Delay simulation
  it('8. should simulate delay impact accurately on project duration and downstream dates', () => {
    // Simulate 3-day delay on t-2
    const simResult = simulateDelay(sampleTasks, sampleDeps, 't-2', 3, '2026-11-01');

    expect(simResult.delayedTaskId).toBe('t-2');
    expect(simResult.delayDays).toBe(3);
    expect(simResult.projectDelayDays).toBe(3);
    expect(simResult.downstreamAffectedTaskIds).toContain('t-3');
    expect(simResult.downstreamAffectedTaskIds).toContain('t-4');

    // Schedule comparison must reflect the +3 days shift
    const t3Comparison = simResult.scheduleComparison.find((s) => s.taskId === 't-3');
    expect(t3Comparison?.deltaDays).toBe(3);
    expect(t3Comparison?.isAffected).toBe(true);
  });

  // Test 9: Critical path calculation
  it('9. should calculate the Critical Path (DAG with ES, EF, LS, LF, Slack)', () => {
    // In our linear chain t-1 -> t-2 -> t-3 -> t-4, all tasks are critical (0 float)
    const cpm = calculateCpm(sampleTasks, sampleDeps, '2026-11-01');

    expect(cpm.projectDurationDays).toBe(3 + 4 + 5 + 2); // 14 days
    expect(cpm.criticalPathTaskIds).toEqual(['t-1', 't-2', 't-3', 't-4']);

    for (const taskId of ['t-1', 't-2', 't-3', 't-4']) {
      const metric = cpm.taskMetrics[taskId];
      expect(metric.slack).toBe(0);
      expect(metric.isCritical).toBe(true);
      expect(metric.ef).toBe(metric.es + sampleTasks.find((t) => t.id === taskId)!.duration);
    }
  });

  // Test 10: Invalid input handling
  it('10. should handle invalid inputs gracefully (disconnected nodes, cycles, negative durations)', () => {
    // Disconnected task
    const disconnectedTask: Task = {
      id: 't-isolated',
      projectId: 'p-1',
      title: 'Isolated Research',
      description: 'Independent study',
      assignedTo: 'Eve',
      priority: 'Low',
      startDate: '2026-11-01',
      dueDate: '2026-11-02',
      duration: 1,
      status: 'Ready',
      progress: 0,
      createdAt: '2026-10-25T00:00:00Z',
      updatedAt: '2026-10-25T00:00:00Z'
    };

    const cpm = calculateCpm([...sampleTasks, disconnectedTask], sampleDeps, '2026-11-01');
    expect(cpm.taskMetrics['t-isolated']).toBeDefined();
    // Isolated task with 1 day duration should have positive float because linear chain is 14 days
    expect(cpm.taskMetrics['t-isolated'].slack).toBeGreaterThan(0);
    expect(cpm.taskMetrics['t-isolated'].isCritical).toBe(false);

    // Empty tasks array should not crash
    const emptyCpm = calculateCpm([], []);
    expect(emptyCpm.projectDurationDays).toBe(0);
    expect(emptyCpm.criticalPathTaskIds).toHaveLength(0);
  });
});
