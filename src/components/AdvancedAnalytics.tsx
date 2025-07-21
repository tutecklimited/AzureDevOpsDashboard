import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Clock, Users, Target, Activity } from 'lucide-react';
import { WorkItem, ProjectMetrics, DashboardStats } from '../types';

interface AdvancedAnalyticsProps {
  workItems: WorkItem[];
  projectMetrics: ProjectMetrics[];
  dashboardStats: DashboardStats;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ 
  workItems, 
  projectMetrics, 
  dashboardStats 
}) => {
  const [distributionType, setDistributionType] = useState<'status' | 'priority' | 'type'>('status');

  // Analytics overview metrics
  const analyticsMetrics = useMemo(() => {
    const totalItems = workItems.length;
    const completedItems = workItems.filter(item => 
      item.status === 'Closed' || item.status === 'Resolved'
    ).length;
    const activeItems = workItems.filter(item => 
      item.status === 'Active' || item.status === 'To Do' || item.status === 'Doing'
    ).length;
    const criticalItems = workItems.filter(item => item.priority === 'Critical').length;

    return {
      totalItems,
      completedItems,
      activeItems,
      criticalItems,
      completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    };
  }, [workItems]);

  // Distribution data based on selected type
  const distributionData = useMemo(() => {
    const counts = new Map();
    
    workItems.forEach(item => {
      let key;
      switch (distributionType) {
        case 'status':
          key = item.status;
          break;
        case 'priority':
          key = item.priority;
          break;
        case 'type':
          key = item.type;
          break;
        default:
          key = item.status;
      }
      
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: workItems.length > 0 ? ((value / workItems.length) * 100).toFixed(1) : '0'
    }));
  }, [workItems, distributionType]);

  // Project performance data
  const projectPerformanceData = useMemo(() => {
    return projectMetrics.map(project => {
      const projectItems = workItems.filter(item => item.project === project.projectName);
      const resolved = projectItems.filter(item => 
        item.status === 'Closed' || item.status === 'Resolved'
      ).length;
      const active = projectItems.filter(item => 
        item.status === 'Active' || item.status === 'To Do' || item.status === 'Doing'
      ).length;

      return {
        name: project.projectName.length > 15 ? 
              project.projectName.substring(0, 15) + '...' : 
              project.projectName,
        fullName: project.projectName,
        resolved,
        active,
        total: projectItems.length
      };
    }).sort((a, b) => b.total - a.total);
  }, [workItems, projectMetrics]);

  // Ageing analysis for active items only (To Do and Doing states)
  const ageingAnalysis = useMemo(() => {
    const activeItems = workItems.filter(item => 
      item.status === 'To Do' || item.status === 'Doing'
    );
    
    const today = new Date();
    const ranges = {
      '0-7 Days': 0,
      '8-30 Days': 0,
      '31-90 Days': 0,
      '90+ Days': 0
    };

    activeItems.forEach(item => {
      const createdDate = new Date(item.createdDate);
      const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 7) {
        ranges['0-7 Days']++;
      } else if (daysDiff <= 30) {
        ranges['8-30 Days']++;
      } else if (daysDiff <= 90) {
        ranges['31-90 Days']++;
      } else {
        ranges['90+ Days']++;
      }
    });

    return ranges;
  }, [workItems]);

  // Velocity trend for last 7 days
  const velocityTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const created = workItems.filter(item => item.createdDate === date).length;
      const completed = workItems.filter(item => 
        (item.status === 'Closed' || item.status === 'Resolved') && 
        item.changedDate === date
      ).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created,
        completed
      };
    });
  }, [workItems]);

  // Color schemes for different chart types
  const getColors = (type: string) => {
    switch (type) {
      case 'status':
        return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      case 'priority':
        return ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#6b7280'];
      case 'type':
        return ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      default:
        return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    }
  };

  const colors = getColors(distributionType);

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Work Items</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsMetrics.totalItems}</p>
              <p className="text-xs font-medium text-gray-500">All projects</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Items</p>
              <p className="text-2xl font-bold text-green-900">{analyticsMetrics.completedItems}</p>
              <p className="text-xs font-medium text-gray-500">{analyticsMetrics.completionRate.toFixed(1)}% completion rate</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Items</p>
              <p className="text-2xl font-bold text-orange-900">{analyticsMetrics.activeItems}</p>
              <p className="text-xs font-medium text-gray-500">In progress</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Items</p>
              <p className="text-2xl font-bold text-red-900">{analyticsMetrics.criticalItems}</p>
              <p className="text-xs font-medium text-gray-500">High priority</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Analysis and Project Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Analysis */}
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <PieChartIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Distribution Analysis</h3>
                <p className="text-sm text-gray-600">Work item breakdown</p>
              </div>
            </div>
            <select
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value as 'status' | 'priority' | 'type')}
              className="px-3 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="status">By Status</option>
              <option value="priority">By Priority</option>
              <option value="type">By Type</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Performance */}
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Project Performance</h3>
              <p className="text-sm text-gray-600">Resolved vs Active items</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name, props) => [value, name, props.payload.fullName]}
                />
                <Legend />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                <Bar dataKey="active" fill="#f59e0b" name="Active" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ageing Analysis */}
      <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ageing Analysis</h3>
            <p className="text-sm text-gray-600">Active work items by age (To Do and Doing states only)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-green-900 mb-2">{ageingAnalysis['0-7 Days']}</div>
            <p className="text-sm font-medium text-green-800 mb-1">0-7 Days</p>
            <p className="text-xs text-green-700">Recent items</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-900 mb-2">{ageingAnalysis['8-30 Days']}</div>
            <p className="text-sm font-medium text-yellow-800 mb-1">8-30 Days</p>
            <p className="text-xs text-yellow-700">Moderate age</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-orange-900 mb-2">{ageingAnalysis['31-90 Days']}</div>
            <p className="text-sm font-medium text-orange-800 mb-1">31-90 Days</p>
            <p className="text-xs text-orange-700">Aging items</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-red-900 mb-2">{ageingAnalysis['90+ Days']}</div>
            <p className="text-sm font-medium text-red-800 mb-1">90+ Days</p>
            <p className="text-xs text-red-700">Stale items</p>
          </div>
        </div>
      </div>

      {/* Velocity Trend */}
      <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Velocity Trend</h3>
            <p className="text-sm text-gray-600">Created vs Completed items (Last 7 days)</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Created"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Completed"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;