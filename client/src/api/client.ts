import {
  User,
  Project,
  Task,
  TaskDependency,
  ActivityLog,
  DelaySimulationResult,
  AnalyticsData
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    getMe: async (): Promise<{ success: boolean; user: User | null }> => {
      return fetchJson('/auth/me');
    },
    login: async (email: string): Promise<{ success: boolean; user: User; token: string }> => {
      return fetchJson('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    demoLogin: async (): Promise<{ success: boolean; user: User; token: string }> => {
      return fetchJson('/auth/demo-login', { method: 'POST' });
    }
  },

  projects: {
    list: async (): Promise<{ success: boolean; projects: Project[] }> => {
      return fetchJson('/projects');
    },
    get: async (id: string): Promise<{
      success: boolean;
      project: Project;
      tasks: Task[];
      dependencies: TaskDependency[];
      activityLogs: ActivityLog[];
    }> => {
      return fetchJson(`/projects/${id}`);
    },
    create: async (data: Partial<Project>): Promise<{ success: boolean; project: Project }> => {
      return fetchJson('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: Partial<Project>): Promise<{ success: boolean; project: Project }> => {
      return fetchJson(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return fetchJson(`/projects/${id}`, { method: 'DELETE' });
    }
  },

  tasks: {
    list: async (projectId: string): Promise<{
      success: boolean;
      tasks: Task[];
      cpmSummary: { projectDurationDays: number; criticalPathTaskIds: string[]; earliestProjectFinishDate: string };
    }> => {
      return fetchJson(`/projects/${projectId}/tasks`);
    },
    create: async (projectId: string, data: Partial<Task>): Promise<{ success: boolean; task: Task }> => {
      return fetchJson(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (projectId: string, taskId: string, data: Partial<Task>): Promise<{ success: boolean; task: Task }> => {
      return fetchJson(`/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    updatePosition: async (projectId: string, taskId: string, x: number, y: number): Promise<{ success: boolean }> => {
      return fetchJson(`/projects/${projectId}/tasks/${taskId}/position`, {
        method: 'PATCH',
        body: JSON.stringify({ x, y })
      });
    },
    delete: async (projectId: string, taskId: string): Promise<{ success: boolean }> => {
      return fetchJson(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
    }
  },

  dependencies: {
    list: async (projectId: string): Promise<{ success: boolean; dependencies: TaskDependency[] }> => {
      return fetchJson(`/projects/${projectId}/dependencies`);
    },
    validate: async (
      projectId: string,
      sourceTaskId: string,
      targetTaskId: string
    ): Promise<{ success: boolean; hasCycle: boolean; message?: string; cyclePath?: string[] }> => {
      return fetchJson(`/projects/${projectId}/dependencies/validate`, {
        method: 'POST',
        body: JSON.stringify({ sourceTaskId, targetTaskId })
      });
    },
    create: async (
      projectId: string,
      data: { sourceTaskId: string; targetTaskId: string; type?: string; lagDays?: number }
    ): Promise<{ success: boolean; dependency: TaskDependency }> => {
      return fetchJson(`/projects/${projectId}/dependencies`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    delete: async (projectId: string, depId: string): Promise<{ success: boolean }> => {
      return fetchJson(`/projects/${projectId}/dependencies/${depId}`, { method: 'DELETE' });
    }
  },

  simulation: {
    simulate: async (
      projectId: string,
      delayedTaskId: string,
      delayDays: number
    ): Promise<{ success: boolean; simulation: DelaySimulationResult }> => {
      return fetchJson(`/projects/${projectId}/simulate`, {
        method: 'POST',
        body: JSON.stringify({ delayedTaskId, delayDays })
      });
    }
  },

  analytics: {
    get: async (projectId: string): Promise<AnalyticsData & { success: boolean }> => {
      return fetchJson(`/projects/${projectId}/analytics`);
    }
  },

  demo: {
    reset: async (): Promise<{ success: boolean; message: string; projects: Project[] }> => {
      return fetchJson('/demo/reset', { method: 'POST' });
    }
  }
};
