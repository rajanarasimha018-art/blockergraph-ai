import { Router } from 'express';
import { db } from '../db/db.js';
import { z } from 'zod';
import { simulateDelay } from '../engine/simulator.js';

const router = Router({ mergeParams: true });

const simulateSchema = z.object({
  delayedTaskId: z.string().min(1, 'Task ID to delay is required'),
  delayDays: z.number().int().min(1, 'Delay must be at least 1 day').max(60, 'Maximum simulation delay is 60 days')
});

// POST /api/projects/:projectId/simulate
router.post('/', (req, res) => {
  const { projectId } = req.params as any;
  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
  }

  const { delayedTaskId, delayDays } = parsed.data;
  const tasks = db.getTasksByProject(projectId);
  const dependencies = db.getDependenciesByProject(projectId);

  const targetTask = tasks.find((t) => t.id === delayedTaskId);
  if (!targetTask) {
    return res.status(404).json({ success: false, error: 'Target task for simulation not found' });
  }

  const simulationResult = simulateDelay(
    tasks,
    dependencies,
    delayedTaskId,
    delayDays,
    project.startDate
  );

  db.logActivity(
    projectId,
    'DELAY_SIMULATION',
    `Simulated ${delayDays}-day delay on "${targetTask.title}". Downstream impact: ${simulationResult.downstreamAffectedTaskIds.length} tasks affected, project delivery shifted by ${simulationResult.projectDelayDays} days.`
  );

  res.json({
    success: true,
    simulation: simulationResult
  });
});

export default router;
