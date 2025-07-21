import { WorkItem, ProjectMetrics, DashboardStats } from '../types';

// Mock Azure DevOps data
export const mockWorkItems: WorkItem[] = [
  {
    id: 1001,
    title: "Login page not responding on mobile",
    type: "Bug",
    status: "Active",
    priority: "High",
    assignedTo: "John Doe",
    createdDate: "2025-01-15",
    project: "WebApp Frontend"
  },
  {
    id: 1002,
    title: "Database connection timeout",
    type: "Bug",
    status: "Resolved",
    priority: "Critical",
    assignedTo: "Jane Smith",
    createdDate: "2025-01-10",
    resolvedDate: "2025-01-14",
    project: "WebApp Backend"
  },
  {
    id: 1003,
    title: "Implement user authentication",
    type: "Task",
    status: "Closed",
    priority: "High",
    assignedTo: "Mike Johnson",
    createdDate: "2025-01-08",
    resolvedDate: "2025-01-12",
    project: "WebApp Backend"
  },
  {
    id: 1004,
    title: "UI styling inconsistencies",
    type: "Bug",
    status: "New",
    priority: "Medium",
    assignedTo: "Sarah Wilson",
    createdDate: "2025-01-16",
    project: "WebApp Frontend"
  },
  {
    id: 1005,
    title: "Add payment integration",
    type: "Feature",
    status: "Active",
    priority: "High",
    assignedTo: "Tom Brown",
    createdDate: "2025-01-12",
    project: "E-commerce Platform"
  }
];

export const mockProjectMetrics: ProjectMetrics[] = [
  {
    projectName: "WebApp Frontend",
    totalBugs: 15,
    activeBugs: 8,
    resolvedBugs: 7,
    reopenBugs: 0,
    totalTasks: 25,
    activeTasks: 12,
    completedTasks: 13,
    reopenTasks: 0,
    bugTrend: [
      { date: "2025-01-10", resolved: 2, created: 3, active: 12 },
      { date: "2025-01-11", resolved: 1, created: 2, active: 13 },
      { date: "2025-01-12", resolved: 3, created: 1, active: 11 },
      { date: "2025-01-13", resolved: 2, created: 2, active: 11 },
      { date: "2025-01-14", resolved: 1, created: 4, active: 14 },
      { date: "2025-01-15", resolved: 2, created: 1, active: 13 },
      { date: "2025-01-16", resolved: 1, created: 3, active: 15 }
    ],
    taskTrend: [
      { date: "2025-01-10", resolved: 3, created: 2, active: 18 },
      { date: "2025-01-11", resolved: 2, created: 1, active: 17 },
      { date: "2025-01-12", resolved: 4, created: 3, active: 16 },
      { date: "2025-01-13", resolved: 1, created: 2, active: 17 },
      { date: "2025-01-14", resolved: 3, created: 1, active: 15 },
      { date: "2025-01-15", resolved: 2, created: 2, active: 15 },
      { date: "2025-01-16", resolved: 1, created: 1, active: 15 }
    ]
  },
  {
    projectName: "WebApp Backend",
    totalBugs: 8,
    activeBugs: 3,
    resolvedBugs: 5,
    reopenBugs: 0,
    totalTasks: 18,
    activeTasks: 7,
    completedTasks: 11,
    reopenTasks: 0,
    bugTrend: [
      { date: "2025-01-10", resolved: 1, created: 2, active: 6 },
      { date: "2025-01-11", resolved: 2, created: 1, active: 5 },
      { date: "2025-01-12", resolved: 1, created: 1, active: 5 },
      { date: "2025-01-13", resolved: 1, created: 0, active: 4 },
      { date: "2025-01-14", resolved: 2, created: 1, active: 3 },
      { date: "2025-01-15", resolved: 0, created: 1, active: 4 },
      { date: "2025-01-16", resolved: 1, created: 0, active: 3 }
    ],
    taskTrend: [
      { date: "2025-01-10", resolved: 2, created: 1, active: 12 },
      { date: "2025-01-11", resolved: 1, created: 2, active: 13 },
      { date: "2025-01-12", resolved: 3, created: 1, active: 11 },
      { date: "2025-01-13", resolved: 2, created: 1, active: 10 },
      { date: "2025-01-14", resolved: 1, created: 2, active: 11 },
      { date: "2025-01-15", resolved: 2, created: 0, active: 9 },
      { date: "2025-01-16", resolved: 1, created: 1, active: 9 }
    ]
  },
  {
    projectName: "E-commerce Platform",
    totalBugs: 12,
    activeBugs: 6,
    resolvedBugs: 6,
    reopenBugs: 0,
    totalTasks: 32,
    activeTasks: 15,
    completedTasks: 17,
    reopenTasks: 0,
    bugTrend: [
      { date: "2025-01-10", resolved: 1, created: 3, active: 8 },
      { date: "2025-01-11", resolved: 2, created: 2, active: 8 },
      { date: "2025-01-12", resolved: 1, created: 1, active: 8 },
      { date: "2025-01-13", resolved: 3, created: 2, active: 7 },
      { date: "2025-01-14", resolved: 1, created: 2, active: 8 },
      { date: "2025-01-15", resolved: 2, created: 1, active: 7 },
      { date: "2025-01-16", resolved: 1, created: 2, active: 8 }
    ],
    taskTrend: [
      { date: "2025-01-10", resolved: 3, created: 2, active: 22 },
      { date: "2025-01-11", resolved: 2, created: 3, active: 23 },
      { date: "2025-01-12", resolved: 4, created: 1, active: 20 },
      { date: "2025-01-13", resolved: 2, created: 2, active: 20 },
      { date: "2025-01-14", resolved: 3, created: 1, active: 18 },
      { date: "2025-01-15", resolved: 1, created: 2, active: 19 },
      { date: "2025-01-16", resolved: 2, created: 1, active: 18 }
    ]
  }
];

export const mockDashboardStats: DashboardStats = {
  totalProjects: 3,
  totalBugs: 35,
  totalTasks: 75,
  criticalBugs: 4,
  bugResolutionRate: 68.5,
  taskCompletionRate: 75.2
};