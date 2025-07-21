import React, { useState } from 'react';
import { FileText, CheckCircle, Clock, TrendingUp, Activity, AlertTriangle, RefreshCw, RotateCcw, Users, Timer, Target, BarChart3, PieChart, Calendar, Award, Zap } from 'lucide-react';
import { ProjectMetrics, DashboardStats } from '../types';
import ProjectSelector from './ProjectSelector';
import MetricsCard from './MetricsCard';
import WorkItemsList from './WorkItemsList';
import ProjectHealthChart from './ProjectHealthChart';
import WorkItemsStackedChart from './WorkItemsStackedChart';
import ProjectHealthStatus from './ProjectHealthStatus';
import AdvancedAnalytics from './AdvancedAnalytics';
import TeamPerformance from './TeamPerformance';
import TrendAnalysis from './TrendAnalysis';
import ProjectReports from './ProjectReports';
import { WorkItem } from '../types';

interface DashboardProps {
  projectMetrics: ProjectMetrics[];
  dashboardStats: DashboardStats;
  onRefresh: () => void;
  isRefreshing: boolean;
  workItems: WorkItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projectMetrics, 
  dashboardStats, 
  onRefresh, 
  isRefreshing,
  workItems
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'team' | 'trends'>('overview');

  // Sort projects alphabetically everywhere
  const sortedProjectMetrics = [...projectMetrics].sort((a, b) => a.projectName.localeCompare(b.projectName));
  const sortedProjectNames = sortedProjectMetrics.map(p => p.projectName);

  const filteredMetrics = selectedProject === 'all' 
    ? sortedProjectMetrics 
    : sortedProjectMetrics.filter(p => p.projectName === selectedProject);

  // Filter work items based on selected project for accurate counts
  const filteredWorkItems = selectedProject === 'all' 
    ? workItems 
    : workItems.filter(item => item.project === selectedProject);

  // Calculate accurate counts based on exact states from work items table
  const aggregatedData = {
    totalWorkItems: filteredWorkItems.length,
    // Match exact states from work items table
    closedWorkItems: filteredWorkItems.filter(item => item.status === 'Closed').length,
    resolvedWorkItems: filteredWorkItems.filter(item => item.status === 'Resolved').length,
    todoWorkItems: filteredWorkItems.filter(item => item.status === 'To Do').length,
    reopenWorkItems: filteredWorkItems.filter(item => 
      item.status === 'Removed' || 
      item.status === 'Reopened' || 
      item.status === 'Reopen' ||
      item.status === 'Rejected' ||
      item.status.toLowerCase().includes('reopen')
    ).length,
    // Additional states that might be present
    newWorkItems: filteredWorkItems.filter(item => item.status === 'New').length,
    activeWorkItems: filteredWorkItems.filter(item => item.status === 'Active').length,
    doneWorkItems: filteredWorkItems.filter(item => item.status === 'Done').length
  };

  // Priority Analytics - only for specific states
  const priorityAnalyticsItems = filteredWorkItems.filter(item => 
    ['To Do', 'Doing'].includes(item.status) ||
    item.status === 'Removed' || 
    item.status === 'Reopened' || 
    item.status === 'Reopen' ||
    item.status === 'Rejected' ||
    item.status.toLowerCase().includes('reopen')
  );

  // Debug: Log priority distribution
  console.log('Priority Analytics Items:', priorityAnalyticsItems.length);
  console.log('Not A Bug count:', priorityAnalyticsItems.filter(item => item.priority === 'Not A Bug').length);
  console.log('All priorities:', priorityAnalyticsItems.map(item => item.priority));

  // Prepare data for charts
  const chartData = filteredMetrics.map(project => ({
    name: project.projectName,
    totalWorkItems: project.totalWorkItems,
    resolved: filteredWorkItems.filter(item => 
      item.project === project.projectName && item.status === 'Resolved'
    ).length,
    todo: filteredWorkItems.filter(item => 
      item.project === project.projectName && item.status === 'To Do'
    ).length,
    reopen: filteredWorkItems.filter(item => 
      item.project === project.projectName && 
      (item.status === 'Removed' || 
       item.status === 'Reopened' || 
       item.status === 'Reopen' ||
       item.status === 'Rejected' ||
       item.status.toLowerCase().includes('reopen'))
    ).length
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'team', label: 'Team Performance', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl transform translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-white/20 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Activity className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-semibold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Azure DevOps Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 font-medium flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>NSSO-V1 Organization • Live Data</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900 text-lg">{dashboardStats.totalProjects}</span>
                <span className="text-blue-700 font-medium">Projects</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <FileText className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900 text-lg">{dashboardStats.totalWorkItems}</span>
                <span className="text-emerald-700 font-medium">Work Items</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900 text-lg">{Math.round(dashboardStats.workItemResolutionRate)}%</span>
                <span className="text-purple-700 font-medium">Success Rate</span>
              </div>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Project Selector */}
        <div className="mb-4">
          <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl py-2 px-4 hover:shadow-3xl transition-all duration-500">
            <ProjectSelector 
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
              projects={sortedProjectNames}
            />
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-4">
          <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl p-2">
            <nav className="flex space-x-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Enhanced Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricsCard
                title="Total Work Items"
                value={aggregatedData.totalWorkItems}
                icon={FileText}
                color="blue"
                trend={5.2}
                subtitle="Across all projects"
              />
              <MetricsCard
                title="Total Closed"
                value={aggregatedData.closedWorkItems}
                icon={CheckCircle}
                color="green"
                trend={12.3}
                subtitle="Successfully completed"
              />
              <MetricsCard
                title="Total Resolved"
                value={aggregatedData.resolvedWorkItems}
                icon={CheckCircle}
                color="green"
                trend={12.3}
                subtitle="Issues resolved"
              />
              <MetricsCard
                title="Total To Do"
                value={aggregatedData.todoWorkItems}
                icon={Clock}
                color="blue"
                trend={8.1}
                subtitle="Awaiting action"
              />
            </div>

            {/* Today's Activity Cards */}
            <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl p-4 mb-6 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-lg shadow-2xl">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">!</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-medium bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 bg-clip-text text-transparent">Today's Activity</h2>
                  <p className="text-gray-600 font-medium">Real-time updates from your team</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group text-center p-3 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border border-blue-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
                    {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      return filteredWorkItems.filter(item => item.createdDate === today).length;
                    })()}
                  </div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Created Today</p>
                  <p className="text-xs text-blue-700 font-medium">New work items added</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="group text-center p-3 bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 border border-emerald-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-2">
                    {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      return filteredWorkItems.filter(item => 
                        (item.status === 'Closed' || item.status === 'Resolved') && 
                        item.changedDate === today
                      ).length;
                    })()}
                  </div>
                  <p className="text-sm font-medium text-emerald-900 mb-1">Completed Today</p>
                  <p className="text-xs text-emerald-700 font-medium">Closed & resolved items</p>
                  <div className="mt-2 w-full bg-emerald-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-1 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="group text-center p-3 bg-gradient-to-br from-orange-50 via-red-100 to-pink-100 border border-orange-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent mb-2">
                    {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      return filteredWorkItems.filter(item => 
                        (item.status === 'Removed' || 
                         item.status === 'Reopened' || 
                         item.status === 'Reopen' ||
                         item.status === 'Rejected' ||
                         item.status.toLowerCase().includes('reopen')) && 
                        item.changedDate === today
                      ).length;
                    })()}
                  </div>
                  <p className="text-sm font-medium text-orange-900 mb-1">Reopened Today</p>
                  <p className="text-xs text-orange-700 font-medium">Items requiring rework</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-1 rounded-full w-2/5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Priority Analytics */}
            <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl p-4 mb-6 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-lg shadow-2xl">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-medium bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-700 bg-clip-text text-transparent">Priority Analytics</h2>
                  <p className="text-gray-600 font-medium">Focus on what matters most</p>
                </div>
              </div>
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm text-blue-900 border border-blue-200/50 shadow-sm">
                <strong>Scope:</strong> This analysis includes work items in the following states: To Do, Doing, and ReOpen. 
                States like New, Active, Closed, Resolved, Done, and Not a Bug are excluded from priority calculations.
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group text-center p-3 bg-gradient-to-br from-red-50 via-red-100 to-rose-100 border border-red-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent mb-2">
                    {priorityAnalyticsItems.filter(item => item.priority === 'Critical').length}
                  </div>
                  <p className="text-sm font-medium text-red-900 mb-1">Critical</p>
                  <p className="text-xs text-red-700 font-medium">Immediate action</p>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 h-1 rounded-full w-full"></div>
                  </div>
                </div>
                <div className="group text-center p-3 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 border border-orange-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                    {priorityAnalyticsItems.filter(item => item.priority === 'High').length}
                  </div>
                  <p className="text-sm font-medium text-orange-900 mb-1">High</p>
                  <p className="text-xs text-orange-700 font-medium">Important items</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 h-1 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="group text-center p-3 bg-gradient-to-br from-yellow-50 via-yellow-100 to-lime-100 border border-yellow-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-yellow-600 to-lime-700 bg-clip-text text-transparent mb-2">
                    {priorityAnalyticsItems.filter(item => item.priority === 'Medium').length}
                  </div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">Medium</p>
                  <p className="text-xs text-yellow-700 font-medium">Standard priority</p>
                  <div className="mt-2 w-full bg-yellow-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-yellow-500 to-lime-600 h-1 rounded-full w-3/5"></div>
                  </div>
                </div>
                <div className="group text-center p-3 bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 border border-emerald-200/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="text-2xl font-medium bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-2">
                    {priorityAnalyticsItems.filter(item => item.priority === 'Low').length}
                  </div>
                  <p className="text-sm font-medium text-emerald-900 mb-1">Low</p>
                  <p className="text-xs text-emerald-700 font-medium">Schedule later</p>
                  <div className="mt-2 w-full bg-emerald-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-1 rounded-full w-2/5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                <ProjectHealthChart data={chartData} />
              </div>
              <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                <WorkItemsStackedChart data={chartData} />
              </div>
            </div>

            {/* Enhanced Project Health Status */}
            <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl p-4 mb-6 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-lg shadow-2xl">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 bg-clip-text text-transparent">Project Health Status</h2>
                    <p className="text-gray-600 font-medium">Monitor project performance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg border border-green-200/50">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                    <span className="font-medium text-green-800">Excellent</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 rounded-lg border border-yellow-200/50">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
                    <span className="font-medium text-yellow-800">Attention</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 rounded-lg border border-red-200/50">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
                    <span className="font-medium text-red-800">Critical</span>
                  </div>
                </div>
              </div>
              <ProjectHealthStatus projects={filteredMetrics} />
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics 
            workItems={filteredWorkItems} 
            projectMetrics={sortedProjectMetrics.filter(p => selectedProject === 'all' || p.projectName === selectedProject)}
            dashboardStats={dashboardStats}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'team' && (
          <TeamPerformance 
            workItems={filteredWorkItems} 
            projectMetrics={sortedProjectMetrics.filter(p => selectedProject === 'all' || p.projectName === selectedProject)}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'trends' && (
          <TrendAnalysis 
            workItems={filteredWorkItems} 
            projectMetrics={sortedProjectMetrics.filter(p => selectedProject === 'all' || p.projectName === selectedProject)}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Enhanced Work Items List */}
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 rounded-xl overflow-hidden hover:shadow-3xl transition-all duration-500">
          <WorkItemsList selectedProject={selectedProject} workItems={filteredWorkItems} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;