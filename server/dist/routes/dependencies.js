import { Router } from 'express';
import { db } from '../db/db.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { detectCycle } from '../engine/graph.js';
import { analyzeBlockers } from '../engine/blocker.js';
const router = Router({ mergeParams: true });
const depSchema = z.object({
    sourceTaskId: z.string().min(1, 'Source task ID is required'),
    targetTaskId: z.string().min(1, 'Target task ID is required'),
    type: z.literal('finish_to_start').default('finish_to_start'),
    lagDays: z.number().int().min(0).default(0)
});
// GET /api/projects/:projectId/dependencies
router.get('/', (req, res) => {
    const { projectId } = req.params;
    const project = db.getProjectById(projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const dependencies = db.getDependenciesByProject(projectId);
    res.json({ success: true, dependencies });
});
// POST /api/projects/:projectId/dependencies/validate
// Check if candidate edge creates cycle without creating it
router.post('/validate', (req, res) => {
    const { projectId } = req.params;
    const parsed = depSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const { sourceTaskId, targetTaskId } = parsed.data;
    const tasks = db.getTasksByProject(projectId);
    const dependencies = db.getDependenciesByProject(projectId);
    // 1. Self-dependency check
    if (sourceTaskId === targetTaskId) {
        const task = tasks.find((t) => t.id === sourceTaskId);
        const title = task ? `"${task.title}"` : sourceTaskId;
        return res.status(400).json({
            success: false,
            hasCycle: true,
            cycleType: 'self_dependency',
            message: `Self-dependency rejected: Task ${title} cannot depend on itself.`
        });
    }
    // 2. Existing dependency check
    const alreadyExists = dependencies.some((d) => d.sourceTaskId === sourceTaskId && d.targetTaskId === targetTaskId);
    if (alreadyExists) {
        return res.status(400).json({
            success: false,
            hasCycle: false,
            message: 'This dependency relationship already exists.'
        });
    }
    // 3. Cycle detection
    const cycleResult = detectCycle(tasks, dependencies, { sourceTaskId, targetTaskId });
    if (cycleResult.hasCycle) {
        return res.status(400).json({
            success: false,
            ...cycleResult
        });
    }
    res.json({
        success: true,
        hasCycle: false,
        message: 'Valid dependency edge.'
    });
});
// POST /api/projects/:projectId/dependencies
router.post('/', (req, res) => {
    const { projectId } = req.params;
    const project = db.getProjectById(projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const parsed = depSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const { sourceTaskId, targetTaskId, type, lagDays } = parsed.data;
    const tasks = db.getTasksByProject(projectId);
    const dependencies = db.getDependenciesByProject(projectId);
    // Validate tasks exist in project
    const sourceExists = tasks.some((t) => t.id === sourceTaskId);
    const targetExists = tasks.some((t) => t.id === targetTaskId);
    if (!sourceExists || !targetExists) {
        return res.status(400).json({ success: false, error: 'Both source and target tasks must exist in the project' });
    }
    // 1. Check self-dependency
    if (sourceTaskId === targetTaskId) {
        const task = tasks.find((t) => t.id === sourceTaskId);
        const title = task ? `"${task.title}"` : sourceTaskId;
        return res.status(400).json({
            success: false,
            error: `Self-dependency rejected: Task ${title} cannot depend on itself.`,
            cycleType: 'self_dependency'
        });
    }
    // 2. Duplicate dependency check
    const duplicate = dependencies.find((d) => d.sourceTaskId === sourceTaskId && d.targetTaskId === targetTaskId);
    if (duplicate) {
        return res.status(400).json({ success: false, error: 'Dependency relationship already exists' });
    }
    // 3. Graph cycle detection
    const cycleResult = detectCycle(tasks, dependencies, { sourceTaskId, targetTaskId });
    if (cycleResult.hasCycle) {
        db.logActivity(projectId, 'CYCLE_REJECTED', `Prevented circular dependency loop: ${cycleResult.cyclePath?.join(' → ')}`);
        return res.status(400).json({
            success: false,
            error: cycleResult.message || 'Adding this dependency would cause a circular dependency cycle.',
            ...cycleResult
        });
    }
    // 4. Create and save dependency
    const newDep = db.createDependency({
        id: `dep-${uuidv4().substring(0, 8)}`,
        projectId,
        sourceTaskId,
        targetTaskId,
        type,
        lagDays,
        createdAt: new Date().toISOString()
    });
    // Re-evaluate blocker status for target task
    const allTasks = db.getTasksByProject(projectId);
    const updatedDeps = db.getDependenciesByProject(projectId);
    const blockers = analyzeBlockers(allTasks, updatedDeps);
    for (const t of allTasks) {
        if (t.status !== 'Completed') {
            const isB = blockers[t.id]?.isBlocked;
            if (isB && t.status !== 'Blocked') {
                db.updateTask(t.id, { status: 'Blocked' });
            }
        }
    }
    res.status(201).json({ success: true, dependency: newDep });
});
// DELETE /api/projects/:projectId/dependencies/:depId
router.delete('/:depId', (req, res) => {
    const { projectId, depId } = req.params;
    const project = db.getProjectById(projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const success = db.deleteDependency(depId);
    if (!success) {
        return res.status(404).json({ success: false, error: 'Dependency not found' });
    }
    // Re-sync blocker statuses
    const allTasks = db.getTasksByProject(projectId);
    const updatedDeps = db.getDependenciesByProject(projectId);
    const blockers = analyzeBlockers(allTasks, updatedDeps);
    for (const t of allTasks) {
        if (t.status !== 'Completed') {
            const isB = blockers[t.id]?.isBlocked;
            if (!isB && t.status === 'Blocked') {
                db.updateTask(t.id, { status: 'Ready' });
            }
        }
    }
    res.json({ success: true, message: 'Dependency removed' });
});
export default router;
