import { AzureWorkItem, AzureProject } from '../services/azureDevOpsService';
import { WorkItem, ProjectMetrics, TrendData, DashboardStats } from '../types';

export const transformAzureWorkItem = (azureItem: AzureWorkItem): WorkItem => {
  const priorityMap: { [key: number]: 'Critical' | 'High' | 'Medium' | 'Low' } = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low'
  };

  // Handle priority field - check both numeric and string values
  let priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Not A Bug' = 'Medium';
  const priorityField = azureItem.fields['Microsoft.VSTS.Common.Priority'];
  
  console.log('Priority field value:', priorityField, 'Type:', typeof priorityField);
  
  if (typeof priorityField === 'number') {
    priority = priorityMap[priorityField] || 'Medium';
  } else if (typeof priorityField === 'string') {
    // Handle string priorities - check for "Not A Bug" variations
    const lowerPriority = priorityField.toLowerCase().trim();
    if (lowerPriority === 'not a bug' || 
        lowerPriority === 'not-a-bug' ||
        lowerPriority === 'notabug' ||
        priorityField === 'Not A Bug' ||
        priorityField === 'Not-A-Bug' ||
        priorityField === 'NotABug' ||
        lowerPriority.includes('not a bug') ||
        lowerPriority.includes('not-a-bug')) {
      priority = 'Not A Bug';
      console.log('Detected Not A Bug priority for item:', azureItem.id);
    } else if (lowerPriority === 'critical') {
      priority = 'Critical';
    } else if (lowerPriority === 'high') {
      priority = 'High';
    } else if (lowerPriority === 'medium') {
      priority = 'Medium';
    } else if (lowerPriority === 'low') {
      priority = 'Low';
    } else {
      // Try to match the string directly
      const normalizedPriority = priorityField.charAt(0).toUpperCase() + priorityField.slice(1).toLowerCase();
      if (['Critical', 'High', 'Medium', 'Low'].includes(normalizedPriority)) {
        priority = normalizedPriority as any;
      } else {
        console.log('Unknown priority field:', priorityField, 'for item:', azureItem.id);
        priority = 'Medium';
      }
    }
  } else if (priorityField === null || priorityField === undefined) {
    // Handle null/undefined priority
    priority = 'Medium';
  } else {
    console.log('Unexpected priority field type:', typeof priorityField, priorityField);
    priority = 'Medium';
  }

  const getStateCategory = (state: string): string => {
    const categoryMap: { [key: string]: string } = {
      'New': 'Proposed',
      'To Do': 'Proposed',
      'Active': 'InProgress',
      'Approved': 'InProgress',
      'Committed': 'InProgress',
      'Doing': 'InProgress',
      'In Progress': 'InProgress',
      'Done': 'Complete',
      'Resolved': 'Resolved',
      'Closed': 'Complete',
      'Removed': 'Removed'
    };
    return categoryMap[state] || 'InProgress';
  };

  return {
    id: azureItem.id,
    title: azureItem.fields['System.Title'],
    type: azureItem.fields['System.WorkItemType'] as 'Bug' | 'Task' | 'User Story' | 'Feature',
    status: azureItem.fields['System.State'],
    priority,
    assignedTo: azureItem.fields['System.AssignedTo']?.displayName || 'Unassigned',
    createdBy: azureItem.fields['System.CreatedBy']?.displayName || 'Unknown',
    createdDate: new Date(azureItem.fields['System.CreatedDate']).toISOString().split('T')[0],
    changedDate: new Date(azureItem.fields['System.ChangedDate']).toISOString().split('T')[0],
    resolvedDate: azureItem.fields['Microsoft.VSTS.Common.ResolvedDate'] 
      ? new Date(azureItem.fields['Microsoft.VSTS.Common.ResolvedDate']).toISOString().split('T')[0]
      : undefined,
    project: azureItem.fields['System.TeamProject'],
    tags: azureItem.fields['System.Tags'] || '',
    stateCategory: getStateCategory(azureItem.fields['System.State'])
  };
};

export const calculateProjectMetrics = (workItems: WorkItem[], projectName: string): ProjectMetrics => {
  const projectItems = workItems.filter(item => item.project === projectName);
  
  const bugs = projectItems.filter(item => item.type === 'Bug');
  const tasks = projectItems.filter(item => item.type === 'Task' || item.type === 'User Story');

  // Use state categories for better classification
  const activeBugs = bugs.filter(bug => bug.stateCategory === 'InProgress' || bug.stateCategory === 'Proposed').length;
  const resolvedBugs = bugs.filter(bug => bug.stateCategory === 'Resolved' || bug.stateCategory === 'Complete').length;
  const reopenBugs = bugs.filter(bug => bug.stateCategory === 'Removed').length;
  
  const activeTasks = tasks.filter(task => task.stateCategory === 'InProgress' || task.stateCategory === 'Proposed').length;
  const completedTasks = tasks.filter(task => task.stateCategory === 'Resolved' || task.stateCategory === 'Complete').length;
  const reopenTasks = tasks.filter(task => task.stateCategory === 'Removed').length;

  // Calculate overall work item metrics
  const totalWorkItems = projectItems.length;
  const activeWorkItems = projectItems.filter(item => item.stateCategory === 'InProgress' || item.stateCategory === 'Proposed').length;
  const resolvedWorkItems = projectItems.filter(item => item.stateCategory === 'Resolved' || item.stateCategory === 'Complete').length;
  const reopenWorkItems = projectItems.filter(item => 
    item.status === 'Removed' || 
    item.status === 'Reopened' || 
    item.status === 'Reopen' ||
    item.status === 'Rejected' ||
    item.status.toLowerCase().includes('reopen')
  ).length;

  // Calculate additional metrics
  const criticalItems = projectItems.filter(item => item.priority === 'Critical').length;
  // Count "Not A Bug" items by checking both priority field and status field
  const notABugItems = projectItems.filter(item => {
    // Check if priority is "Not A Bug" (various formats)
    if (item.priority === 'Not A Bug') return true;
    
    // Also check if status contains "Not A Bug" or similar variations
    const status = item.status.toLowerCase().trim();
    return status === 'not a bug' || 
           status === 'not-a-bug' || 
           status === 'notabug' ||
           status.includes('not a bug') ||
           status.includes('not-a-bug');
  }).length;
  
  const uniqueAssignees = new Set(projectItems.map(item => item.assignedTo).filter(assignee => assignee !== 'Unassigned')).size;
  
  // Calculate average resolution time
  const resolvedItems = projectItems.filter(item => item.resolvedDate);
  const avgResolutionTime = resolvedItems.length > 0 
    ? resolvedItems.reduce((sum, item) => {
        const created = new Date(item.createdDate);
        const resolved = new Date(item.resolvedDate!);
        return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
      }, 0) / resolvedItems.length
    : 0;

  // Generate trend data for the last 7 days
  const bugTrend = generateTrendData(bugs, 7);
  const taskTrend = generateTrendData(tasks, 7);

  return {
    projectName,
    totalBugs: bugs.length,
    activeBugs,
    resolvedBugs,
    reopenBugs,
    totalTasks: tasks.length,
    activeTasks,
    completedTasks,
    reopenTasks,
    bugTrend,
    taskTrend,
    totalWorkItems,
    activeWorkItems,
    resolvedWorkItems,
    reopenWorkItems,
    teamMembers: uniqueAssignees,
    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    criticalItems,
    notABugItems
  };
};

const generateTrendData = (items: WorkItem[], days: number): TrendData[] => {
  const trendData: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const createdOnDate = items.filter(item => item.createdDate === dateString).length;
    const resolvedOnDate = items.filter(item => item.resolvedDate === dateString).length;
    
    // Calculate active items up to this date
    const activeOnDate = items.filter(item => {
      const createdDate = new Date(item.createdDate);
      const resolvedDate = item.resolvedDate ? new Date(item.resolvedDate) : null;
      
      return createdDate <= date && (!resolvedDate || resolvedDate > date);
    }).length;

    trendData.push({
      date: dateString,
      created: createdOnDate,
      resolved: resolvedOnDate,
      active: activeOnDate
    });
  }

  return trendData;
};

export const calculateDashboardStats = (workItems: WorkItem[], projects: AzureProject[]): DashboardStats => {
  const totalWorkItems = workItems.length;
  // Match exact states from work items table
  const totalClosed = workItems.filter(item => item.status === 'Closed').length;
  const totalResolved = workItems.filter(item => item.status === 'Resolved').length;
  const totalReopen = workItems.filter(item => 
    item.status === 'Removed' || 
    item.status === 'Reopened' || 
    item.status === 'Reopen' ||
    item.status === 'Rejected' ||
    item.status.toLowerCase().includes('reopen')
  ).length;
  const totalTodo = workItems.filter(item => item.status === 'To Do').length;
  const criticalItemsCount = workItems.filter(item => item.priority === 'Critical').length;

  const workItemResolutionRate = totalWorkItems > 0 ? (totalResolved / totalWorkItems) * 100 : 0;

  // Calculate unique team members
  const uniqueTeamMembers = new Set(
    workItems
      .map(item => item.assignedTo)
      .filter(assignee => assignee && assignee !== 'Unassigned' && assignee.trim() !== '')
  ).size;

  // Calculate average resolution time
  const resolvedItems = workItems.filter(item => item.resolvedDate);
  const avgResolutionTime = resolvedItems.length > 0 
    ? resolvedItems.reduce((sum, item) => {
        const created = new Date(item.createdDate);
        const resolved = new Date(item.resolvedDate!);
        return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / resolvedItems.length
    : 0;

  // Find most active project
  const projectWorkItemCounts = projects.map(project => ({
    name: project.name,
    count: workItems.filter(item => item.project === project.name).length
  }));
  const mostActiveProject = projectWorkItemCounts.reduce((max, current) => 
    current.count > max.count ? current : max, { name: 'None', count: 0 }).name;

  return {
    totalProjects: projects.length,
    totalWorkItems,
    totalClosed,
    totalResolved,
    totalReopen,
    totalTodo,
    criticalItemsCount,
    workItemResolutionRate,
    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    mostActiveProject,
    uniqueTeamMembers
  };
};