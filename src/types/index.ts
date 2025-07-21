export interface WorkItem {
  id: number;
  title: string;
  type: 'Bug' | 'Task' | 'User Story' | 'Feature';
  status: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Not A Bug';
  assignedTo: string;
  createdBy: string;
  createdDate: string;
  changedDate: string;
  resolvedDate?: string;
  project: string;
  tags?: string;
  stateCategory: string;
}

export interface ProjectMetrics {
  projectName: string;
  totalBugs: number;
  activeBugs: number;
  resolvedBugs: number;
  reopenBugs: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  reopenTasks: number;
  bugTrend: TrendData[];
  taskTrend: TrendData[];
  totalWorkItems: number;
  activeWorkItems: number;
  resolvedWorkItems: number;
  reopenWorkItems: number;
  teamMembers: number;
  avgResolutionTime: number;
  criticalItems: number;
  notABugItems: number;
}

export interface TrendData {
  date: string;
  resolved: number;
  created: number;
  active: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalWorkItems: number;
  totalClosed: number;
  totalResolved: number;
  totalReopen: number;
  totalTodo: number;
  criticalItemsCount: number;
  workItemResolutionRate: number;
  avgResolutionTime: number;
  mostActiveProject: string;
  uniqueTeamMembers: number;
}