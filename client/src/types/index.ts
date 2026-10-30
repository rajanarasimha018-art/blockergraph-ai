export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Ready' | 'In Progress' | 'Blocked' | 'Completed';
export type ProjectStatus = 'active' | 'completed' | 'on_hold';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
  blockedTaskCount?: number;
  progress?: number;
}

export interface TaskCpmMetrics {
  es: number;
  ef: number;
  ls: number;
  lf: number;
  slack: number;
  isCritical: boolean;
  earliestStartDate: string;
  earliestFinishDate: string;
  latestStartDate: string;
  latestFinishDate: string;
}

export interface BlockerInfo {
  taskId: string;
  isBlocked: boolean;
  blockingPrerequisites: {
    id: string;
    title: string;
    status: TaskStatus;
    assignedTo: string;
    dueDate: string;
  }[];
  dependentCount: number;
  downstreamImpactIds: string[];
  suggestedNextAction: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: Priority;
  startDate: string;
  dueDate: string;
  duration: number;
  status: TaskStatus;
  progress: number;
  tags?: string[];
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
  blockerInfo?: BlockerInfo;
  cpmMetrics?: TaskCpmMetrics;
}

export interface TaskDependency {
  id: string;
  projectId: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'finish_to_start';
  lagDays: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  action: string;
  description: string;
  userId?: string;
  timestamp: string;
}

export interface DelaySimulationResult {
  delayedTaskId: string;
  delayDays: number;
  originalProjectDuration: number;
  simulatedProjectDuration: number;
  projectDelayDays: number;
  originalProjectEndDate: string;
  simulatedProjectEndDate: string;
  downstreamAffectedTaskIds: string[];
  tasksAtRisk: {
    taskId: string;
    title: string;
    originalFinish: string;
    simulatedFinish: string;
    dueDate: string;
    delayDays: number;
    exceedsDueDate: boolean;
    slackRemaining: number;
  }[];
  criticalPathChanged: boolean;
  originalCriticalPath: string[];
  simulatedCriticalPath: string[];
  scheduleComparison: {
    taskId: string;
    title: string;
    originalStart: string;
    originalFinish: string;
    simulatedStart: string;
    simulatedFinish: string;
    deltaDays: number;
    isAffected: boolean;
  }[];
}

export interface ProjectInsight {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  affectedTaskIds: string[];
  recommendedAction?: string;
}

export interface AnalyticsData {
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    readyTasks: number;
    overdueTasks: number;
    completionRate: number;
    criticalPathLength: number;
    projectDurationDays: number;
    earliestProjectFinishDate: string;
  };
  charts: {
    statusDistribution: { name: string; count: number; percentage: number }[];
    priorityDistribution: { name: string; count: number }[];
    timelineProjection: {
      title: string;
      duration: number;
      es: number;
      ef: number;
      slack: number;
      isCritical: boolean;
      status: TaskStatus;
    }[];
  };
  criticalPathTasks: Task[];
  blockedTasksList: {
    task: Task;
    analysis: BlockerInfo;
  }[];
  insights: ProjectInsight[];
}
