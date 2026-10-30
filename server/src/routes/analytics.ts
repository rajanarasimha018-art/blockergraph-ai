import { Router } from 'express';
import { db } from '../db/db.js';
import { calculateCpm } from '../engine/cpm.js';
import { analyzeBlockers } from '../engine/blocker.js';
import { generateProjectInsights } from '../engine/intelligence.js';

const router = Router({ mergeParams: true });

// GET /api/projects/:projectId/analytics
router.get('/', (req, res) => {
  const { projectId } = req.params as any;
  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const tasks = db.getTasksByProject(projectId);
  const dependencies = db.getDependenciesByProject(projectId);

  const today = new Date().toISOString().split('T')[0];

  // 1. Task counts by status
  const statusCounts = {
    Ready: 0,
    'In Progress': 0,
    Blocked: 0,
    Completed: 0
  };

  // 2. Task counts by priority
  const priorityCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0
  };

  let overdueCount = 0;
  for (const t of tasks) {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
    if (t.status !== 'Completed' && t.dueDate < today) {
      overdueCount++;
    }
  }

  const totalTasks = tasks.length;
  const completedTasks = statusCounts.Completed;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. CPM Analysis
  const cpm = calculateCpm(tasks, dependencies, project.startDate);

  // 4. Blocker Analysis
  const blockers = analyzeBlockers(tasks, dependencies);
  const blockedTasksList = tasks
    .filter((t) => blockers[t.id]?.isBlocked)
    .map((t) => ({
      task: t,
      analysis: blockers[t.id]
    }));

  // 5. Project Intelligence Insights
  const insights = generateProjectInsights(tasks, dependencies, project.startDate);

  // 6. Formatted Charts Data for Recharts
  const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    count: value,
    percentage: totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0
  }));

  const priorityDistribution = Object.entries(priorityCounts).map(([name, value]) => ({
    name,
    count: value
  }));

  // Burndown / Timeline projection
  const timelineProjection = tasks.map((t) => {
    const metrics = cpm.taskMetrics[t.id];
    return {
      title: t.title,
      duration: t.duration,
      es: metrics?.es ?? 0,
      ef: metrics?.ef ?? t.duration,
      slack: metrics?.slack ?? 0,
      isCritical: metrics?.isCritical ?? false,
      status: t.status
    };
  });

  res.json({
    success: true,
    summary: {
      totalTasks,
      completedTasks,
      inProgressTasks: statusCounts['In Progress'],
      blockedTasks: statusCounts.Blocked,
      readyTasks: statusCounts.Ready,
      overdueTasks: overdueCount,
      completionRate,
      criticalPathLength: cpm.criticalPathTaskIds.length,
      projectDurationDays: cpm.projectDurationDays,
      earliestProjectFinishDate: cpm.earliestProjectFinishDate
    },
    charts: {
      statusDistribution,
      priorityDistribution,
      timelineProjection
    },
    criticalPathTasks: tasks.filter((t) => cpm.criticalPathTaskIds.includes(t.id)),
    blockedTasksList,
    insights
  });
});

export default router;
