import { User, Project, Task, TaskDependency, ActivityLog } from '../types/index.js';
import { DatabaseState } from './db.js';

export function getSampleSeedData(): DatabaseState {
  const demoUser: User = {
    id: 'user-alex-chen',
    email: 'alex.chen@blockergraph.ai',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Lead System Architect'
  };

  const project: Project = {
    id: 'proj-nebula-v2',
    name: 'Nebula Orchestrator v2.0 - Cloud Infrastructure Release',
    description:
      'Next-generation distributed container runtime, automated edge routing, and intelligent dependency-aware workload scheduler.',
    startDate: '2026-11-01',
    targetDate: '2026-12-15',
    status: 'active',
    userId: demoUser.id,
    createdAt: '2026-10-25T08:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z'
  };

  const tasks: Task[] = [
    {
      id: 'task-01',
      projectId: project.id,
      title: 'System Architecture & API Specs',
      description: 'Define microservice interface boundaries, OpenAPI schemas, and RPC protocols.',
      assignedTo: 'Alex Chen',
      priority: 'Critical',
      startDate: '2026-11-01',
      dueDate: '2026-11-04',
      duration: 3,
      status: 'Completed',
      progress: 100,
      tags: ['Architecture', 'Core'],
      positionX: 50,
      positionY: 150,
      createdAt: '2026-10-25T09:00:00.000Z',
      updatedAt: '2026-11-04T17:00:00.000Z'
    },
    {
      id: 'task-02',
      projectId: project.id,
      title: 'PostgreSQL DB Schema & Migrations',
      description: 'Set up Supabase tables, row-level security policies, and performance indexes.',
      assignedTo: 'Sarah Connor',
      priority: 'High',
      startDate: '2026-11-02',
      dueDate: '2026-11-05',
      duration: 3,
      status: 'Completed',
      progress: 100,
      tags: ['Database', 'Supabase'],
      positionX: 50,
      positionY: 350,
      createdAt: '2026-10-25T09:30:00.000Z',
      updatedAt: '2026-11-05T18:00:00.000Z'
    },
    {
      id: 'task-03',
      projectId: project.id,
      title: 'Auth Service & RBAC Tokens',
      description: 'Implement JWT authentication, refresh cookie rotation, and granular permissions.',
      assignedTo: 'Marcus Vance',
      priority: 'High',
      startDate: '2026-11-04',
      dueDate: '2026-11-08',
      duration: 4,
      status: 'Completed',
      progress: 100,
      tags: ['Security', 'Auth'],
      positionX: 350,
      positionY: 50,
      createdAt: '2026-10-25T10:00:00.000Z',
      updatedAt: '2026-11-08T16:00:00.000Z'
    },
    {
      id: 'task-04',
      projectId: project.id,
      title: 'API Gateway & Edge Routing',
      description: 'Deploy Envoy reverse proxy, rate limiting, and mTLS verification between services.',
      assignedTo: 'David Kim',
      priority: 'Critical',
      startDate: '2026-11-05',
      dueDate: '2026-11-10',
      duration: 5,
      status: 'In Progress',
      progress: 65,
      tags: ['Networking', 'Critical-Path'],
      positionX: 350,
      positionY: 250,
      createdAt: '2026-10-25T11:00:00.000Z',
      updatedAt: '2026-11-09T14:30:00.000Z'
    },
    {
      id: 'task-05',
      projectId: project.id,
      title: 'Stripe Billing & Subscription Webhooks',
      description: 'Integrate usage metering, automated invoices, and tier entitlement verification.',
      assignedTo: 'Elena Rostova',
      priority: 'Medium',
      startDate: '2026-11-10',
      dueDate: '2026-11-14',
      duration: 4,
      status: 'Blocked',
      progress: 15,
      tags: ['Billing', 'Stripe'],
      positionX: 680,
      positionY: 100,
      createdAt: '2026-10-26T08:00:00.000Z',
      updatedAt: '2026-11-09T14:30:00.000Z'
    },
    {
      id: 'task-06',
      projectId: project.id,
      title: 'Real-Time WebSocket State Engine',
      description: 'Build bi-directional node cluster synchronization with sub-10ms latency.',
      assignedTo: 'Kenji Sato',
      priority: 'High',
      startDate: '2026-11-04',
      dueDate: '2026-11-11',
      duration: 5,
      status: 'In Progress',
      progress: 45,
      tags: ['WebSockets', 'Backend'],
      positionX: 350,
      positionY: 450,
      createdAt: '2026-10-26T09:00:00.000Z',
      updatedAt: '2026-11-09T15:00:00.000Z'
    },
    {
      id: 'task-07',
      projectId: project.id,
      title: 'AI Autonomous Workload Balancer',
      description: 'Train heuristic model for predicting cloud instance spot pricing and traffic peaks.',
      assignedTo: 'Priya Sharma',
      priority: 'Critical',
      startDate: '2026-11-10',
      dueDate: '2026-11-18',
      duration: 7,
      status: 'Blocked',
      progress: 0,
      tags: ['AI/ML', 'Optimizer'],
      positionX: 680,
      positionY: 280,
      createdAt: '2026-10-26T10:00:00.000Z',
      updatedAt: '2026-11-09T15:00:00.000Z'
    },
    {
      id: 'task-08',
      projectId: project.id,
      title: 'Glassmorphic Design System Components',
      description: 'Build Tailwind + shadcn UI component library with dark futuristic theme.',
      assignedTo: 'Liam Vance',
      priority: 'Medium',
      startDate: '2026-11-01',
      dueDate: '2026-11-05',
      duration: 4,
      status: 'Completed',
      progress: 100,
      tags: ['UI/UX', 'Design'],
      positionX: 50,
      positionY: 600,
      createdAt: '2026-10-25T08:30:00.000Z',
      updatedAt: '2026-11-05T19:00:00.000Z'
    },
    {
      id: 'task-09',
      projectId: project.id,
      title: 'Interactive Dependency Graph Canvas',
      description: 'Implement React Flow visualizer with custom nodes, cycle detection, and mini-map.',
      assignedTo: 'Liam Vance',
      priority: 'Critical',
      startDate: '2026-11-06',
      dueDate: '2026-11-12',
      duration: 5,
      status: 'In Progress',
      progress: 70,
      tags: ['Frontend', 'ReactFlow'],
      positionX: 350,
      positionY: 650,
      createdAt: '2026-10-26T11:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-10',
      projectId: project.id,
      title: 'Real-Time Telemetry & Metrics UI',
      description: 'Recharts dashboard displaying node CPU, latency distribution, and blocker counts.',
      assignedTo: 'Liam Vance',
      priority: 'Medium',
      startDate: '2026-11-12',
      dueDate: '2026-11-16',
      duration: 4,
      status: 'Blocked',
      progress: 0,
      tags: ['Frontend', 'Analytics'],
      positionX: 680,
      positionY: 500,
      createdAt: '2026-10-26T12:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-11',
      projectId: project.id,
      title: 'End-to-End Cypress Integration Tests',
      description: 'Automated test suite covering signup, project creation, graph edits, and edge cases.',
      assignedTo: 'Sarah Connor',
      priority: 'High',
      startDate: '2026-11-14',
      dueDate: '2026-11-18',
      duration: 4,
      status: 'Blocked',
      progress: 0,
      tags: ['QA', 'Testing'],
      positionX: 980,
      positionY: 150,
      createdAt: '2026-10-27T08:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-12',
      projectId: project.id,
      title: 'SOC2 Compliance & Penetration Audit',
      description: 'Third-party white-hat vulnerability scans, credential auditing, and audit logs.',
      assignedTo: 'Marcus Vance',
      priority: 'Critical',
      startDate: '2026-11-10',
      dueDate: '2026-11-16',
      duration: 5,
      status: 'Blocked',
      progress: 0,
      tags: ['Security', 'Audit'],
      positionX: 680,
      positionY: -50,
      createdAt: '2026-10-27T09:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-13',
      projectId: project.id,
      title: 'High-Concurrency Stress & Load Testing',
      description: 'Simulate 100,000 requests/sec with k6 to verify auto-scaling and failover behavior.',
      assignedTo: 'David Kim',
      priority: 'Critical',
      startDate: '2026-11-18',
      dueDate: '2026-11-22',
      duration: 4,
      status: 'Blocked',
      progress: 0,
      tags: ['DevOps', 'LoadTesting'],
      positionX: 980,
      positionY: 350,
      createdAt: '2026-10-27T10:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-14',
      projectId: project.id,
      title: 'Multi-Region Kubernetes Canary Deployment',
      description: 'Deploy release candidate to AWS us-east-1 and EU Frankfurt staging clusters.',
      assignedTo: 'David Kim',
      priority: 'Critical',
      startDate: '2026-11-22',
      dueDate: '2026-11-26',
      duration: 3,
      status: 'Blocked',
      progress: 0,
      tags: ['DevOps', 'K8s'],
      positionX: 1280,
      positionY: 250,
      createdAt: '2026-10-27T11:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-15',
      projectId: project.id,
      title: 'Global DNS Failover & Production Cutover',
      description: 'Gradual Cloudflare DNS shift from v1.9 to v2.0 with automated rollback triggers.',
      assignedTo: 'Alex Chen',
      priority: 'Critical',
      startDate: '2026-11-26',
      dueDate: '2026-11-28',
      duration: 2,
      status: 'Blocked',
      progress: 0,
      tags: ['Release', 'Production'],
      positionX: 1560,
      positionY: 250,
      createdAt: '2026-10-27T12:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    },
    {
      id: 'task-16',
      projectId: project.id,
      title: 'Post-Launch APM Observability & Alerts',
      description: 'Configure Datadog synthetic monitors, Sentry error budgets, and PagerDuty escalations.',
      assignedTo: 'Kenji Sato',
      priority: 'Medium',
      startDate: '2026-11-28',
      dueDate: '2026-11-30',
      duration: 2,
      status: 'Blocked',
      progress: 0,
      tags: ['Observability', 'Ops'],
      positionX: 1840,
      positionY: 250,
      createdAt: '2026-10-27T13:00:00.000Z',
      updatedAt: '2026-11-09T16:00:00.000Z'
    }
  ];

  const dependencies: TaskDependency[] = [
    // Task 01 (Architecture) -> Task 03 (Auth), Task 04 (API Gateway), Task 06 (WebSocket)
    { id: 'dep-01', projectId: project.id, sourceTaskId: 'task-01', targetTaskId: 'task-03', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:00:00.000Z' },
    { id: 'dep-02', projectId: project.id, sourceTaskId: 'task-01', targetTaskId: 'task-04', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:05:00.000Z' },
    { id: 'dep-03', projectId: project.id, sourceTaskId: 'task-01', targetTaskId: 'task-06', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:10:00.000Z' },

    // Task 02 (DB Schema) -> Task 04 (API Gateway), Task 07 (AI Workload Balancer)
    { id: 'dep-04', projectId: project.id, sourceTaskId: 'task-02', targetTaskId: 'task-04', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:15:00.000Z' },
    { id: 'dep-05', projectId: project.id, sourceTaskId: 'task-02', targetTaskId: 'task-07', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:20:00.000Z' },

    // Task 03 (Auth) -> Task 12 (SOC2 Audit)
    { id: 'dep-06', projectId: project.id, sourceTaskId: 'task-03', targetTaskId: 'task-12', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:25:00.000Z' },

    // Task 04 (API Gateway) -> Task 05 (Stripe Billing), Task 07 (AI Workload Balancer), Task 12 (SOC2 Audit)
    { id: 'dep-07', projectId: project.id, sourceTaskId: 'task-04', targetTaskId: 'task-05', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:30:00.000Z' },
    { id: 'dep-08', projectId: project.id, sourceTaskId: 'task-04', targetTaskId: 'task-07', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:35:00.000Z' },
    { id: 'dep-09', projectId: project.id, sourceTaskId: 'task-04', targetTaskId: 'task-12', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:40:00.000Z' },

    // Task 08 (Design System) -> Task 09 (Graph Canvas), Task 10 (Telemetry UI)
    { id: 'dep-10', projectId: project.id, sourceTaskId: 'task-08', targetTaskId: 'task-09', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:45:00.000Z' },
    { id: 'dep-11', projectId: project.id, sourceTaskId: 'task-08', targetTaskId: 'task-10', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:50:00.000Z' },

    // Task 06 (WebSocket) -> Task 10 (Telemetry UI)
    { id: 'dep-12', projectId: project.id, sourceTaskId: 'task-06', targetTaskId: 'task-10', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T14:55:00.000Z' },

    // Task 05 (Billing), Task 09 (Graph Canvas) -> Task 11 (E2E Tests)
    { id: 'dep-13', projectId: project.id, sourceTaskId: 'task-05', targetTaskId: 'task-11', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:00:00.000Z' },
    { id: 'dep-14', projectId: project.id, sourceTaskId: 'task-09', targetTaskId: 'task-11', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:05:00.000Z' },

    // Task 07 (AI Balancer), Task 11 (E2E Tests) -> Task 13 (Stress & Load Testing)
    { id: 'dep-15', projectId: project.id, sourceTaskId: 'task-07', targetTaskId: 'task-13', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:10:00.000Z' },
    { id: 'dep-16', projectId: project.id, sourceTaskId: 'task-11', targetTaskId: 'task-13', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:15:00.000Z' },

    // Task 12 (SOC2 Audit) & Task 13 (Load Testing) -> Task 14 (Canary K8s Deployment)
    { id: 'dep-17', projectId: project.id, sourceTaskId: 'task-12', targetTaskId: 'task-14', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:20:00.000Z' },
    { id: 'dep-18', projectId: project.id, sourceTaskId: 'task-13', targetTaskId: 'task-14', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:25:00.000Z' },

    // Task 14 (Canary) -> Task 15 (DNS Cutover)
    { id: 'dep-19', projectId: project.id, sourceTaskId: 'task-14', targetTaskId: 'task-15', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:30:00.000Z' },

    // Task 15 (DNS Cutover) -> Task 16 (Post-launch Observability)
    { id: 'dep-20', projectId: project.id, sourceTaskId: 'task-15', targetTaskId: 'task-16', type: 'finish_to_start', lagDays: 0, createdAt: '2026-10-25T15:35:00.000Z' }
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: 'act-01',
      projectId: project.id,
      action: 'PROJECT_CREATED',
      description: 'Project "Nebula Orchestrator v2.0" initialized with 16 core architectural tasks.',
      userId: demoUser.id,
      timestamp: '2026-10-25T08:00:00.000Z'
    },
    {
      id: 'act-02',
      projectId: project.id,
      action: 'TASK_COMPLETED',
      description: 'Alex Chen completed "System Architecture & API Specs".',
      userId: demoUser.id,
      timestamp: '2026-11-04T17:00:00.000Z'
    },
    {
      id: 'act-03',
      projectId: project.id,
      action: 'TASK_COMPLETED',
      description: 'Sarah Connor completed "PostgreSQL DB Schema & Migrations".',
      userId: demoUser.id,
      timestamp: '2026-11-05T18:00:00.000Z'
    },
    {
      id: 'act-04',
      projectId: project.id,
      action: 'TASK_COMPLETED',
      description: 'Marcus Vance completed "Auth Service & RBAC Tokens".',
      userId: demoUser.id,
      timestamp: '2026-11-08T16:00:00.000Z'
    },
    {
      id: 'act-05',
      projectId: project.id,
      action: 'BLOCKER_DETECTED',
      description: 'Task "Stripe Billing & Subscription Webhooks" is waiting on "API Gateway & Edge Routing".',
      userId: demoUser.id,
      timestamp: '2026-11-09T10:00:00.000Z'
    }
  ];

  return {
    users: [demoUser],
    projects: [project],
    tasks,
    dependencies,
    activityLogs
  };
}
