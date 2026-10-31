import {
  User,
  Project,
  Task,
  TaskDependency,
  ActivityLog,
  DelaySimulationResult,
  AnalyticsData
} from '../types';

/**
 * Resolves the API base URL in development and production:
 * - When VITE_API_URL is configured (e.g. on Vercel), normalizes the URL:
 *   Strips any trailing slashes and ensures the `/api` prefix is present.
 *   Examples:
 *     'https://my-backend.onrender.com'     -> 'https://my-backend.onrender.com/api'
 *     'https://my-backend.onrender.com/'    -> 'https://my-backend.onrender.com/api'
 *     'https://my-backend.onrender.com/api' -> 'https://my-backend.onrender.com/api'
 * - When VITE_API_URL is unset (standard local dev):
 *   Defaults to '/api', preserving the local Vite dev proxy to http://localhost:5000.
 */
export function resolveApiBase(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  const trimmed = envUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export const API_BASE = resolveApiBase();

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE}${cleanPath}`;

  // Read stored auth token if available
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('blockergraph_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>)
  };

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: options?.credentials ?? 'include'
    });
  } catch (networkErr: any) {
    throw new Error(
      `Network error connecting to API (${fullUrl}): ${networkErr.message || networkErr}. ` +
      `Please check that the backend server is running and accessible.`
    );
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!isJson) {
    const rawText = await res.text();
    const preview = rawText.trim().slice(0, 160).replace(/\s+/g, ' ');
    if (!res.ok) {
      const err: any = new Error(
        `API ${res.status} (${res.statusText || 'Error'}): Server returned non-JSON response from ${fullUrl}. ` +
        (res.status === 404
          ? `Verify that VITE_API_URL points to the active backend API and that the route exists. Preview: "${preview || 'empty'}"`
          : `Preview: "${preview || 'empty'}"`)
      );
      err.status = res.status;
      err.rawResponse = rawText;
      throw err;
    }
    const err: any = new Error(
      `Expected JSON response but received '${contentType || 'unknown'}' from ${fullUrl}. Preview: "${preview || 'empty'}"`
    );
    err.status = res.status;
    err.rawResponse = rawText;
    throw err;
  }

  let data: any;
  try {
    data = await res.json();
  } catch (jsonErr: any) {
    const err: any = new Error(
      `Failed to parse JSON response from ${fullUrl} (Status ${res.status}): ${jsonErr.message}`
    );
    err.status = res.status;
    throw err;
  }

  if (!res.ok || data?.success === false) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.data = data;
    err.status = res.status;
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
      const res = await fetchJson<{ success: boolean; user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (res.token && typeof localStorage !== 'undefined') {
        localStorage.setItem('blockergraph_token', res.token);
      }
      return res;
    },
    demoLogin: async (): Promise<{ success: boolean; user: User; token: string }> => {
      const res = await fetchJson<{ success: boolean; user: User; token: string }>('/auth/demo-login', { method: 'POST' });
      if (res.token && typeof localStorage !== 'undefined') {
        localStorage.setItem('blockergraph_token', res.token);
      }
      return res;
    },
    logout: async (): Promise<{ success: boolean }> => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('blockergraph_token');
      }
      return { success: true };
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
