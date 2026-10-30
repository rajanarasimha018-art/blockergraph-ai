import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Project, Task, TaskDependency, ActivityLog } from '../types/index.js';
import { getSampleSeedData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  dependencies: TaskDependency[];
  activityLogs: ActivityLog[];
}

class Database {
  private state: DatabaseState = {
    users: [],
    projects: [],
    tasks: [],
    dependencies: [],
    activityLogs: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      } else {
        // Seed initial data
        this.resetToSeed();
      }
    } catch (err) {
      console.error('Error initializing database file, falling back to seed data:', err);
      this.resetToSeed();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public resetToSeed(): DatabaseState {
    this.state = getSampleSeedData();
    this.persist();
    return this.state;
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  // --- PROJECTS ---
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public createProject(project: Project): Project {
    this.state.projects.push(project);
    this.logActivity(project.id, 'PROJECT_CREATED', `Project "${project.name}" was created.`);
    this.persist();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.state.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.state.projects[idx] = {
      ...this.state.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.logActivity(id, 'PROJECT_UPDATED', `Project details updated.`);
    this.persist();
    return this.state.projects[idx];
  }

  public deleteProject(id: string): boolean {
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
  public getTasksByProject(projectId: string): Task[] {
    return this.state.tasks.filter((t) => t.projectId === projectId);
  }

  public getTaskById(id: string): Task | undefined {
    return this.state.tasks.find((t) => t.id === id);
  }

  public createTask(task: Task): Task {
    this.state.tasks.push(task);
    this.logActivity(task.projectId, 'TASK_CREATED', `Task "${task.title}" created with priority ${task.priority}.`);
    this.persist();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const oldStatus = this.state.tasks[idx].status;
    this.state.tasks[idx] = {
      ...this.state.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.status && updates.status !== oldStatus) {
      this.logActivity(
        this.state.tasks[idx].projectId,
        'TASK_STATUS_CHANGED',
        `Task "${this.state.tasks[idx].title}" status updated to ${updates.status}.`
      );
    }
    this.persist();
    return this.state.tasks[idx];
  }

  public deleteTask(id: string): boolean {
    const task = this.getTaskById(id);
    if (!task) return false;
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    // Delete attached dependencies
    this.state.dependencies = this.state.dependencies.filter(
      (d) => d.sourceTaskId !== id && d.targetTaskId !== id
    );
    this.logActivity(task.projectId, 'TASK_DELETED', `Task "${task.title}" and its dependency links were removed.`);
    this.persist();
    return true;
  }

  // --- DEPENDENCIES ---
  public getDependenciesByProject(projectId: string): TaskDependency[] {
    return this.state.dependencies.filter((d) => d.projectId === projectId);
  }

  public getDependencyById(id: string): TaskDependency | undefined {
    return this.state.dependencies.find((d) => d.id === id);
  }

  public createDependency(dep: TaskDependency): TaskDependency {
    this.state.dependencies.push(dep);
    const source = this.getTaskById(dep.sourceTaskId)?.title || dep.sourceTaskId;
    const target = this.getTaskById(dep.targetTaskId)?.title || dep.targetTaskId;
    this.logActivity(
      dep.projectId,
      'DEPENDENCY_ADDED',
      `Dependency established: "${source}" must finish before "${target}" can start.`
    );
    this.persist();
    return dep;
  }

  public deleteDependency(id: string): boolean {
    const dep = this.getDependencyById(id);
    if (!dep) return false;
    this.state.dependencies = this.state.dependencies.filter((d) => d.id !== id);
    const source = this.getTaskById(dep.sourceTaskId)?.title || dep.sourceTaskId;
    const target = this.getTaskById(dep.targetTaskId)?.title || dep.targetTaskId;
    this.logActivity(
      dep.projectId,
      'DEPENDENCY_REMOVED',
      `Dependency removed between "${source}" and "${target}".`
    );
    this.persist();
    return true;
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(projectId: string): ActivityLog[] {
    return this.state.activityLogs
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  public logActivity(projectId: string, action: string, description: string, userId?: string) {
    const entry: ActivityLog = {
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
