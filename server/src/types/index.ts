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
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  status: ProjectStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: Priority;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  duration: number; // in days (integer >= 1)
  status: TaskStatus;
  progress: number; // 0 - 100
  tags?: string[];
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  id: string;
  projectId: string;
  sourceTaskId: string; // Prerequisite task (upstream)
  targetTaskId: string; // Dependent task (downstream)
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

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleNodeIds?: string[];
  cyclePath?: string[];
  message?: string;
}

export interface TaskCpmMetrics {
  es: number; // Earliest Start (day offset from project start)
  ef: number; // Earliest Finish
  ls: number; // Latest Start
  lf: number; // Latest Finish
  slack: number; // Total Float / Slack = LS - ES = LF - EF
  isCritical: boolean;
  earliestStartDate: string;
  earliestFinishDate: string;
  latestStartDate: string;
  latestFinishDate: string;
}

export interface CpmAnalysisResult {
  projectDurationDays: number;
  criticalPathTaskIds: string[];
  earliestProjectFinishDate: string;
  taskMetrics: Record<string, TaskCpmMetrics>;
}

export interface BlockerAnalysis {
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
