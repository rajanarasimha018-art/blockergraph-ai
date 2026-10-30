import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSampleSeedData } from './seed.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
class Database {
    state = {
        users: [],
        projects: [],
        tasks: [],
        dependencies: [],
        activityLogs: []
    };
    constructor() {
        this.init();
    }
    init() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf-8');
                this.state = JSON.parse(raw);
            }
            else {
                // Seed initial data
                this.resetToSeed();
            }
        }
        catch (err) {
            console.error('Error initializing database file, falling back to seed data:', err);
            this.resetToSeed();
        }
    }
    persist() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Error persisting database:', err);
        }
    }
    resetToSeed() {
        this.state = getSampleSeedData();
        this.persist();
        return this.state;
    }
    // --- USERS ---
    getUsers() {
        return this.state.users;
    }
    getUserById(id) {
        return this.state.users.find((u) => u.id === id);
    }
    // --- PROJECTS ---
    getProjects() {
        return this.state.projects;
    }
    getProjectById(id) {
        return this.state.projects.find((p) => p.id === id);
    }
    createProject(project) {
        this.state.projects.push(project);
        this.logActivity(project.id, 'PROJECT_CREATED', `Project "${project.name}" was created.`);
        this.persist();
        return project;
    }
    updateProject(id, updates) {
        const idx = this.state.projects.findIndex((p) => p.id === id);
        if (idx === -1)
            return null;
        this.state.projects[idx] = {
            ...this.state.projects[idx],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.logActivity(id, 'PROJECT_UPDATED', `Project details updated.`);
        this.persist();
        return this.state.projects[idx];
    }
    deleteProject(id) {
        const initialLen = this.state.projects.length;
        this.state.projects = this.state.projects.filter((p) => p.id !== id);
        // Cascade delete tasks, dependencies, logs
        this.state.tasks = this.state.tasks.filter((t) => t.projectId !== id);
        this.state.dependencies = this.state.dependencies.filter((d) => d.projectId !== id);
        this.state.activityLogs = this.state.activityLogs.filter((a) => a.projectId !== id);
        this.persist();
        return this.state.projects.length < initialLen;
    }
    // --- TASKS ---
    getTasksByProject(projectId) {
        return this.state.tasks.filter((t) => t.projectId === projectId);
    }
    getTaskById(id) {
        return this.state.tasks.find((t) => t.id === id);
    }
    createTask(task) {
        this.state.tasks.push(task);
        this.logActivity(task.projectId, 'TASK_CREATED', `Task "${task.title}" created with priority ${task.priority}.`);
        this.persist();
        return task;
    }
    updateTask(id, updates) {
        const idx = this.state.tasks.findIndex((t) => t.id === id);
        if (idx === -1)
            return null;
        const oldStatus = this.state.tasks[idx].status;
        this.state.tasks[idx] = {
            ...this.state.tasks[idx],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        if (updates.status && updates.status !== oldStatus) {
            this.logActivity(this.state.tasks[idx].projectId, 'TASK_STATUS_CHANGED', `Task "${this.state.tasks[idx].title}" status updated to ${updates.status}.`);
        }
        this.persist();
        return this.state.tasks[idx];
    }
    deleteTask(id) {
        const task = this.getTaskById(id);
        if (!task)
            return false;
        this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
        // Delete attached dependencies
        this.state.dependencies = this.state.dependencies.filter((d) => d.sourceTaskId !== id && d.targetTaskId !== id);
        this.logActivity(task.projectId, 'TASK_DELETED', `Task "${task.title}" and its dependency links were removed.`);
        this.persist();
        return true;
    }
    // --- DEPENDENCIES ---
    getDependenciesByProject(projectId) {
        return this.state.dependencies.filter((d) => d.projectId === projectId);
    }
    getDependencyById(id) {
        return this.state.dependencies.find((d) => d.id === id);
    }
    createDependency(dep) {
        this.state.dependencies.push(dep);
        const source = this.getTaskById(dep.sourceTaskId)?.title || dep.sourceTaskId;
        const target = this.getTaskById(dep.targetTaskId)?.title || dep.targetTaskId;
        this.logActivity(dep.projectId, 'DEPENDENCY_ADDED', `Dependency established: "${source}" must finish before "${target}" can start.`);
        this.persist();
        return dep;
    }
    deleteDependency(id) {
        const dep = this.getDependencyById(id);
        if (!dep)
            return false;
        this.state.dependencies = this.state.dependencies.filter((d) => d.id !== id);
        const source = this.getTaskById(dep.sourceTaskId)?.title || dep.sourceTaskId;
        const target = this.getTaskById(dep.targetTaskId)?.title || dep.targetTaskId;
        this.logActivity(dep.projectId, 'DEPENDENCY_REMOVED', `Dependency removed between "${source}" and "${target}".`);
        this.persist();
        return true;
    }
    // --- ACTIVITY LOGS ---
    getActivityLogs(projectId) {
        return this.state.activityLogs
            .filter((a) => a.projectId === projectId)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    logActivity(projectId, action, description, userId) {
        const entry = {
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            projectId,
            action,
            description,
            userId,
            timestamp: new Date().toISOString()
        };
        this.state.activityLogs.unshift(entry);
        if (this.state.activityLogs.length > 500) {
            this.state.activityLogs.pop();
        }
    }
}
export const db = new Database();
