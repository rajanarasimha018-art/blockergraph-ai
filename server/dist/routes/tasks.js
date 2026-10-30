import { Router } from 'express';
import { db } from '../db/db.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { analyzeBlockers, syncTaskBlockerStatus } from '../engine/blocker.js';
import { calculateCpm } from '../engine/cpm.js';
const router = Router({ mergeParams: true });
const taskCreateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(120),
    description: z.string().optional().default(''),
    assignedTo: z.string().min(1, 'Assignee is required'),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date format must be YYYY-MM-DD'),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date format must be YYYY-MM-DD'),
    duration: z.number().int().min(1, 'Duration must be at least 1 day').default(1),
    status: z.enum(['Ready', 'In Progress', 'Blocked', 'Completed']).default('Ready'),
    progress: z.number().min(0).max(100).default(0),
    tags: z.array(z.string()).optional().default([]),
    positionX: z.number().optional().default(100),
    positionY: z.number().optional().default(100)
});
// GET /api/projects/:projectId/tasks
router.get('/', (req, res) => {
    const { projectId } = req.params;
    const project = db.getProjectById(projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const tasks = db.getTasksByProject(projectId);
    const dependencies = db.getDependenciesByProject(projectId);
    // Compute blockers and CPM
    const blockers = analyzeBlockers(tasks, dependencies);
    const cpm = calculateCpm(tasks, dependencies, project.startDate);
    // Attach dynamic blocker and CPM metadata to tasks
    const enrichedTasks = tasks.map((task) => {
        const blockerInfo = blockers[task.id];
        const cpmInfo = cpm.taskMetrics[task.id];
        // Auto-reflect dynamic blocker state if task is not manually completed
        let dynamicStatus = task.status;
        if (task.status !== 'Completed') {
            if (blockerInfo?.isBlocked) {
                dynamicStatus = 'Blocked';
            }
            else if (task.status === 'Blocked') {
                dynamicStatus = 'Ready';
            }
        }
        return {
            ...task,
            status: dynamicStatus,
            blockerInfo,
            cpmMetrics: cpmInfo
        };
    });
    res.json({
        success: true,
        tasks: enrichedTasks,
        cpmSummary: {
            projectDurationDays: cpm.projectDurationDays,
            criticalPathTaskIds: cpm.criticalPathTaskIds,
            earliestProjectFinishDate: cpm.earliestProjectFinishDate
        }
    });
});
// POST /api/projects/:projectId/tasks
router.post('/', (req, res) => {
    const { projectId } = req.params;
    const project = db.getProjectById(projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const parsed = taskCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const allTasks = db.getTasksByProject(projectId);
    const dependencies = db.getDependenciesByProject(projectId);
    // Auto-stagger layout position if default
    const count = allTasks.length;
    const posX = parsed.data.positionX ?? (100 + (count % 5) * 280);
    const posY = parsed.data.positionY ?? (100 + Math.floor(count / 5) * 180);
    const newTask = db.createTask({
        id: `task-${uuidv4().substring(0, 8)}`,
        projectId,
        ...parsed.data,
        positionX: posX,
        positionY: posY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    // Re-sync blocker status
    const syncedTask = syncTaskBlockerStatus(newTask, [...allTasks, newTask], dependencies);
    if (syncedTask.status !== newTask.status) {
        db.updateTask(newTask.id, { status: syncedTask.status });
    }
    res.status(201).json({ success: true, task: syncedTask });
});
// PUT /api/projects/:projectId/tasks/:taskId
router.put('/:taskId', (req, res) => {
    const { projectId, taskId } = req.params;
    const task = db.getTaskById(taskId);
    if (!task || task.projectId !== projectId) {
        return res.status(404).json({ success: false, error: 'Task not found' });
    }
    const parsed = taskCreateSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const updated = db.updateTask(taskId, parsed.data);
    // If status changed to Completed, downstream tasks might become unblocked
    if (parsed.data.status) {
        const allTasks = db.getTasksByProject(projectId);
        const dependencies = db.getDependenciesByProject(projectId);
        const blockers = analyzeBlockers(allTasks, dependencies);
        for (const t of allTasks) {
            if (t.id !== taskId && t.status !== 'Completed') {
                const isB = blockers[t.id]?.isBlocked;
                if (!isB && t.status === 'Blocked') {
                    db.updateTask(t.id, { status: 'Ready' });
                }
                else if (isB && t.status === 'Ready') {
                    db.updateTask(t.id, { status: 'Blocked' });
                }
            }
        }
    }
    res.json({ success: true, task: updated });
});
// PATCH /api/projects/:projectId/tasks/:taskId/position
router.patch('/:taskId/position', (req, res) => {
    const { projectId, taskId } = req.params;
    const { x, y } = req.body;
    if (typeof x !== 'number' || typeof y !== 'number') {
        return res.status(400).json({ success: false, error: 'x and y coordinates are required' });
    }
    const task = db.getTaskById(taskId);
    if (!task || task.projectId !== projectId) {
        return res.status(404).json({ success: false, error: 'Task not found' });
    }
    db.updateTask(taskId, { positionX: x, positionY: y });
    res.json({ success: true });
});
// DELETE /api/projects/:projectId/tasks/:taskId
router.delete('/:taskId', (req, res) => {
    const { projectId, taskId } = req.params;
    const task = db.getTaskById(taskId);
    if (!task || task.projectId !== projectId) {
        return res.status(404).json({ success: false, error: 'Task not found' });
    }
    const deleted = db.deleteTask(taskId);
    res.json({ success: deleted });
});
export default router;
