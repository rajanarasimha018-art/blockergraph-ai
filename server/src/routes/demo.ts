import { Router } from 'express';
import { db } from '../db/db.js';

const router = Router();

// POST /api/demo/reset
router.post('/reset', (req, res) => {
  const freshState = db.resetToSeed();
  res.json({
    success: true,
    message: 'Demo dataset restored to initial state (16 tasks with rich dependency graph).',
    projects: freshState.projects,
    tasksCount: freshState.tasks.length,
    dependenciesCount: freshState.dependencies.length
  });
});

export default router;
