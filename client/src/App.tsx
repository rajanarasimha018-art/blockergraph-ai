import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Project, Task, TaskDependency, ActivityLog, User, DelaySimulationResult } from './types';
import { api } from './api/client';
import { AppSidebar, TabKey } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';

// Code-split dynamic views
const DependencyGraph = lazy(() =>
  import('./components/graph/DependencyGraph').then((m) => ({ default: m.DependencyGraph }))
);
const DelaySimulator = lazy(() =>
  import('./components/simulator/DelaySimulator').then((m) => ({ default: m.DelaySimulator }))
);
const AnalyticsDashboard = lazy(() =>
  import('./components/analytics/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard }))
);
const TaskListView = lazy(() =>
  import('./components/tasks/TaskListView').then((m) => ({ default: m.TaskListView }))
);
const ProjectsView = lazy(() =>
  import('./components/projects/ProjectsView').then((m) => ({ default: m.ProjectsView }))
);
const SettingsView = lazy(() =>
  import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView }))
);
const TaskModal = lazy(() =>
  import('./components/tasks/TaskModal').then((m) => ({ default: m.TaskModal }))
);
const DependencyModal = lazy(() =>
  import('./components/tasks/DependencyModal').then((m) => ({ default: m.DependencyModal }))
);

function TabLoadingFallback() {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-slate-400">
      <div className="w-7 h-7 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs font-mono">Loading component chunk...</span>
    </div>
  );
}

export function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('overview');
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation state
  const [activeSimulationResult, setActiveSimulationResult] = useState<DelaySimulationResult | null>(null);
  const [simulatorPreselectedTask, setSimulatorPreselectedTask] = useState<Task | null>(null);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [depModalOpen, setDepModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Initial Project and User
  const refreshProjectData = useCallback(async (projectIdToLoad?: string) => {
    try {
      const authRes = await api.auth.getMe();
      if (authRes.user) setUser(authRes.user);

      const projectsRes = await api.projects.list();
      if (projectsRes.projects && projectsRes.projects.length > 0) {
        setAllProjects(projectsRes.projects);
        const targetId = projectIdToLoad || projectsRes.projects[0].id;
        const detailRes = await api.projects.get(targetId);

        setProject(detailRes.project);
        setTasks(detailRes.tasks);
        setDependencies(detailRes.dependencies);
        setActivityLogs(detailRes.activityLogs);
      }
    } catch (err: any) {
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjectData();
  }, [refreshProjectData]);

  // Demo Reset Handler
  const handleResetDemo = async () => {
    setResetLoading(true);
    try {
      await api.demo.reset();
      await refreshProjectData();
      setActiveSimulationResult(null);
      showToast('✓ Demo dataset reset to 16 tasks with rich dependency graph!');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  // Project Switcher
  const handleSelectProject = async (id: string) => {
    setLoading(true);
    await refreshProjectData(id);
    showToast(`Switched workspace project`);
  };

  // Create Project
  const handleCreateProject = async (data: Partial<Project>) => {
    const res = await api.projects.create(data);
    await refreshProjectData(res.project.id);
    showToast(`Created project "${data.name}"`);
  };

  // Task Submission (Create / Edit)
  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (!project) return;
    if (editingTask) {
      await api.tasks.update(project.id, editingTask.id, taskData);
      showToast(`Updated "${taskData.title}"`);
    } else {
      await api.tasks.create(project.id, taskData);
      showToast(`Created task "${taskData.title}"`);
    }
    await refreshProjectData(project.id);
  };

  // Task Deletion
  const handleDeleteTask = async (taskId: string) => {
    if (!project) return;
    await api.tasks.delete(project.id, taskId);
    showToast('Task removed');
    await refreshProjectData(project.id);
  };

  // Task Status Toggle
  const handleUpdateStatus = async (taskId: string, status: Task['status']) => {
    if (!project) return;
    await api.tasks.update(project.id, taskId, { status });
    showToast(`Status updated to ${status}`);
    await refreshProjectData(project.id);
  };

  // Dependency Submission
  const handleDependencySubmit = async (sourceTaskId: string, targetTaskId: string) => {
    if (!project) return;
    await api.dependencies.create(project.id, {
      sourceTaskId,
      targetTaskId,
      type: 'finish_to_start',
      lagDays: 0
    });
    showToast('Dependency link established');
    await refreshProjectData(project.id);
  };

  const handleLaunchSimulatorForTask = (task?: Task) => {
    if (task) setSimulatorPreselectedTask(task);
    setCurrentTab('simulator');
  };

  const handleSelectTaskFromOverview = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const blockedCount = tasks.filter((t) => t.status === 'Blocked').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-3" />
        <h2 className="text-sm font-bold tracking-tight">BlockerGraph AI Core Engine</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Initializing graph topology & CPM calculation engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-lg bg-[#6366F1] text-white font-semibold text-xs shadow-xl animate-in fade-in slide-in-from-bottom duration-150">
          {toastMessage}
        </div>
      )}

      {/* Left Sidebar (Desktop First Layout) */}
      {project && (
        <AppSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          project={project}
          user={user}
          blockedCount={blockedCount}
          tasksCount={tasks.length}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {project && (
          <AppHeader
            currentTab={currentTab}
            project={project}
            allProjects={allProjects}
            onSelectProject={handleSelectProject}
            user={user}
            onResetDemo={handleResetDemo}
            resetLoading={resetLoading}
            blockedCount={blockedCount}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          />
        )}

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {project && currentTab === 'overview' && (
            <OverviewDashboard
              project={project}
              tasks={tasks}
              dependencies={dependencies}
              activityLogs={activityLogs}
              onOpenGraph={() => setCurrentTab('graph')}
              onOpenSimulator={handleLaunchSimulatorForTask}
              onOpenCreateTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              onSelectTask={handleSelectTaskFromOverview}
            />
          )}

          <Suspense fallback={<TabLoadingFallback />}>
            {project && currentTab === 'projects' && (
              <ProjectsView
                projects={allProjects}
                activeProject={project}
                onSelectProject={handleSelectProject}
                onCreateProject={handleCreateProject}
              />
            )}

            {project && currentTab === 'graph' && (
              <div className="space-y-3">
                <DependencyGraph
                  projectId={project.id}
                  tasks={tasks}
                  dependencies={dependencies}
                  onRefresh={() => refreshProjectData(project.id)}
                  onSelectTaskToSimulate={handleLaunchSimulatorForTask}
                  onOpenCreateTaskModal={() => {
                    setEditingTask(null);
                    setTaskModalOpen(true);
                  }}
                  onOpenCreateDepModal={() => setDepModalOpen(true)}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setTaskModalOpen(true);
                  }}
                  activeSimulationResult={activeSimulationResult}
                />
              </div>
            )}

            {project && currentTab === 'simulator' && (
              <DelaySimulator
                projectId={project.id}
                tasks={tasks}
                dependencies={dependencies}
                preselectedTask={simulatorPreselectedTask}
                onApplySimulationToGraph={(sim) => setActiveSimulationResult(sim)}
              />
            )}

            {project && currentTab === 'analytics' && (
              <AnalyticsDashboard projectId={project.id} project={project} />
            )}

            {project && currentTab === 'tasks' && (
              <TaskListView
                tasks={tasks}
                dependencies={dependencies}
                onOpenCreateTask={() => {
                  setEditingTask(null);
                  setTaskModalOpen(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onUpdateStatus={handleUpdateStatus}
                onSimulateDelay={handleLaunchSimulatorForTask}
              />
            )}

            {project && currentTab === 'settings' && (
              <SettingsView
                project={project}
                user={user}
                onResetDemo={handleResetDemo}
                resetLoading={resetLoading}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Task Create/Edit Modal */}
      <Suspense fallback={null}>
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskSubmit}
          initialTask={editingTask}
        />

        {/* Dependency Link Modal */}
        <DependencyModal
          isOpen={depModalOpen}
          onClose={() => setDepModalOpen(false)}
          tasks={tasks}
          onSubmit={handleDependencySubmit}
        />
      </Suspense>
    </div>
  );
}

export default App;
