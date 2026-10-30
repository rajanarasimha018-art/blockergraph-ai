import { Router } from 'express';
import { db } from '../db/db.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().optional().default(''),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be YYYY-MM-DD'),
    status: z.enum(['active', 'completed', 'on_hold']).default('active')
});
router.get('/', (req, res) => {
    const projects = db.getProjects();
    // Include task summary count with each project
    const enriched = projects.map((proj) => {
        const tasks = db.getTasksByProject(proj.id);
        const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
        const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        return {
            ...proj,
            taskCount: tasks.length,
            completedTaskCount: completedTasks,
            blockedTaskCount: blockedTasks,
            progress
        };
    });
    res.json({ success: true, projects: enriched });
});
router.get('/:id', (req, res) => {
    const project = db.getProjectById(req.params.id);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const tasks = db.getTasksByProject(project.id);
    const dependencies = db.getDependenciesByProject(project.id);
    const logs = db.getActivityLogs(project.id);
    res.json({
        success: true,
        project,
        tasks,
        dependencies,
        activityLogs: logs
    });
});
router.post('/', (req, res) => {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const user = db.getUsers()[0];
    const newProject = db.createProject({
        id: `proj-${uuidv4().substring(0, 8)}`,
        ...parsed.data,
        userId: user ? user.id : 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    res.status(201).json({ success: true, project: newProject });
});
router.put('/:id', (req, res) => {
    const parsed = projectSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const updated = db.updateProject(req.params.id, parsed.data);
    if (!updated) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, project: updated });
});
router.delete('/:id', (req, res) => {
    const success = db.deleteProject(req.params.id);
    if (!success) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
});
export default router;
