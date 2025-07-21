import React, { useMemo } from 'react';
import { TrendingUp, Calendar, BarChart3, Activity, Clock, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { WorkItem, ProjectMetrics } from '../types';

interface TrendAnalysisProps {
  workItems: WorkItem[];
  projectMetrics: ProjectMetrics[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ 
  workItems, 
  projectMetrics, 
  onRefresh, 
  isRefreshing 
}) => {
  // Generate trend data for the last 30 days
  const trendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const created = workItems.filter(item => item.createdDate === date).length;
      const completed = workItems.filter(item => 
        (item.status === 'Closed' || item.status === 'Resolved') && 
        item.changedDate === date
      ).length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created,
        completed,
        cumulative: created - completed
      };
    });
  }, [workItems]);

  // Weekly velocity data
  const weeklyVelocity = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      
      const weekItems = workItems.filter(item => {
        const itemDate = new Date(item.createdDate);
        return itemDate >= startDate && itemDate <= endDate;
      });

      const completedItems = workItems.filter(item => {
        const itemDate = new Date(item.changedDate || item.createdDate);
        return (item.status === 'Closed' || item.status === 'Resolved') && 
               itemDate >= startDate && itemDate <= endDate;
      });

      return {
        week: `Week ${8 - i}`,
        created: weekItems.length,
        completed: completedItems.length,
        velocity: completedItems.length
      };
    }).reverse();

    return weeks;
  }, [workItems]);

  // Project velocity comparison
  const projectVelocity = useMemo(() => {
    return projectMetrics.map(project => {
      const projectItems = workItems.filter(item => item.project === project.projectName);
      const last30Days = projectItems.filter(item => {
        const itemDate = new Date(item.createdDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return itemDate >= thirtyDaysAgo;
      });

      const completed30Days = projectItems.filter(item => {
        const itemDate = new Date(item.changedDate || item.createdDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return (item.status === 'Closed' || item.status === 'Resolved') && 
               itemDate >= thirtyDaysAgo;
      });

      return {
        name: project.projectName.length > 15 ? 
              project.projectName.substring(0, 15) + '...' : 
              project.projectName,
        fullName: project.projectName,
        created: last30Days.length,
        completed: completed30Days.length,
        velocity: completed30Days.length / (last30Days.length || 1) * 100
      };
    }).sort((a, b) => b.velocity - a.velocity);
  }, [workItems, projectMetrics]);

  // Calculate trend metrics
  const trendMetrics = useMemo(() => {
    const last7Days = trendData.slice(-7);
    const previous7Days = trendData.slice(-14, -7);
    
    const currentWeekCreated = last7Days.reduce((sum, day) => sum + day.created, 0);
    const previousWeekCreated = previous7Days.reduce((sum, day) => sum + day.created, 0);
    const currentWeekCompleted = last7Days.reduce((sum, day) => sum + day.completed, 0);
    const previousWeekCompleted = previous7Days.reduce((sum, day) => sum + day.completed, 0);

    const createdTrend = previousWeekCreated === 0 ? 0 : 
      ((currentWeekCreated - previousWeekCreated) / previousWeekCreated) * 100;
    const completedTrend = previousWeekCompleted === 0 ? 0 : 
      ((currentWeekCompleted - previousWeekCompleted) / previousWeekCompleted) * 100;

    return {
      currentWeekCreated,
      previousWeekCreated,
      currentWeekCompleted,
      previousWeekCompleted,
      createdTrend,
      completedTrend,
      netVelocity: currentWeekCompleted - currentWeekCreated
    };
  }, [trendData]);

  return (
    <div className="space-y-6">
      {/* Trend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week Created</p>
              <p className="text-2xl font-bold text-blue-900">{trendMetrics.currentWeekCreated}</p>
              <p className={`text-xs font-medium ${trendMetrics.createdTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trendMetrics.createdTrend >= 0 ? '+' : ''}{trendMetrics.createdTrend.toFixed(1)}% from last week
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week Completed</p>
              <p className="text-2xl font-bold text-green-900">{trendMetrics.currentWeekCompleted}</p>
              <p className={`text-xs font-medium ${trendMetrics.completedTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trendMetrics.completedTrend >= 0 ? '+' : ''}{trendMetrics.completedTrend.toFixed(1)}% from last week
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Velocity</p>
              <p className={`text-2xl font-bold ${trendMetrics.netVelocity >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {trendMetrics.netVelocity >= 0 ? '+' : ''}{trendMetrics.netVelocity}
              </p>
              <p className="text-xs font-medium text-gray-500">Completed - Created</p>
            </div>
            <div className={`p-3 ${trendMetrics.netVelocity >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Daily</p>
              <p className="text-2xl font-bold text-purple-900">{(trendMetrics.currentWeekCompleted / 7).toFixed(1)}</p>
              <p className="text-xs font-medium text-gray-500">Items completed per day</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Daily Work Item Trends</h3>
            <p className="text-sm text-gray-600">Created vs Completed over the last 30 days</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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

      {/* Weekly Velocity and Project Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Velocity */}
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Weekly Velocity</h3>
              <p className="text-sm text-gray-600">Items completed per week</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="week" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="velocity" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Velocity Comparison */}
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Project Velocity (30 days)</h3>
              <p className="text-sm text-gray-600">Completion rate by project</p>
            </div>
          </div>
          <div className="space-y-3">
            {projectVelocity.slice(0, 8).map((project, index) => (
              <div key={project.fullName} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900" title={project.fullName}>
                      {project.name}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {project.velocity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>{project.completed} completed</span>
                    <span>•</span>
                    <span>{project.created} created</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 h-1">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1" 
                      style={{ width: `${Math.min(project.velocity, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;