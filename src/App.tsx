import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ConnectionSetup from './components/ConnectionSetup';
import LoadingSpinner from './components/LoadingSpinner';
import { ProjectMetrics, DashboardStats, WorkItem } from './types';
import { AzureDevOpsService, AzureDevOpsConfig } from './services/azureDevOpsService';
import { transformAzureWorkItem, calculateProjectMetrics, calculateDashboardStats } from './utils/dataTransformers';

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalWorkItems: 0,
    totalClosed: 0,
    totalResolved: 0,
    totalReopen: 0,
    totalTodo: 0,
    criticalItemsCount: 0,
    workItemResolutionRate: 0,
    avgResolutionTime: 0,
    mostActiveProject: 'None',
    uniqueTeamMembers: 0
  });
  const [azureService, setAzureService] = useState<AzureDevOpsService | null>(null);

  const handleConnect = async (personalAccessToken: string) => {
    setIsConnecting(true);
    setConnectionError('');

    try {
      const config: AzureDevOpsConfig = {
        organizationUrl: 'https://dev.azure.com/NSSO-V1',
        username: process.env.USERNAME_AZUREDEVOPS,
        personalAccessToken: personalAccessToken
      };

      const service = new AzureDevOpsService(config);
      
      // Test connection by fetching projects
      await service.getProjects();
      
      setAzureService(service);
      setIsConnected(true);
      
      // Fetch initial data
      await fetchData(service);
      
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect to Azure DevOps');
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchData = async (service?: AzureDevOpsService) => {
    const serviceToUse = service || azureService;
    if (!serviceToUse) return;

    setIsLoading(true);
    try {
      console.log('Fetching data from Azure DevOps...');
      
      // Fetch projects and work items in parallel
      const [projects, azureWorkItems] = await Promise.all([
        serviceToUse.getProjects(),
        serviceToUse.getWorkItems()
      ]);

      console.log('Fetched projects:', projects.length);
      console.log('Fetched work items:', azureWorkItems.length);

      // Transform Azure work items to our format
      const transformedWorkItems = azureWorkItems.map(transformAzureWorkItem);
      
      // Calculate project metrics
      const metrics = projects.map(project => 
        calculateProjectMetrics(transformedWorkItems, project.name)
      );

      // Calculate dashboard stats
      const stats = calculateDashboardStats(transformedWorkItems, projects);

      setWorkItems(transformedWorkItems);
      setProjectMetrics(metrics);
      setDashboardStats(stats);

      console.log('Data processing complete');
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to fetch data from Azure DevOps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (azureService) {
      await fetchData();
    }
  };

  // Show connection setup if not connected
  if (!isConnected) {
    return (
      <ConnectionSetup
        onConnect={handleConnect}
        isConnecting={isConnecting}
        error={connectionError}
      />
    );
  }

  // Show loading spinner while fetching data
  if (isLoading && workItems.length === 0) {
    return <LoadingSpinner message="Loading Azure DevOps data..." />;
  }

  return (
    <Dashboard
      projectMetrics={projectMetrics}
      dashboardStats={dashboardStats}
      workItems={workItems}
      onRefresh={handleRefresh}
      isRefreshing={isLoading}
    />
  );
};

export default App;