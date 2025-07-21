import React, { useState } from 'react';
import { FileText, Download, Filter, Search, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { WorkItem, ProjectMetrics } from '../types';

interface ProjectReportsProps {
  workItems: WorkItem[];
  projectMetrics: ProjectMetrics[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ 
  workItems, 
  projectMetrics 
}) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'priority'>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'completed' | 'priority'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Generate comprehensive project reports
  const generateProjectReports = () => {
    return projectMetrics.map(project => {
      const projectWorkItems = workItems.filter(item => item.project === project.projectName);
      
      return {
        name: project.projectName,
        total: projectWorkItems.length,
        closed: projectWorkItems.filter(item => item.status === 'Closed').length,
        resolved: projectWorkItems.filter(item => item.status === 'Resolved').length,
        active: projectWorkItems.filter(item => item.status === 'Active').length,
        todo: projectWorkItems.filter(item => item.status === 'To Do').length,
        new: projectWorkItems.filter(item => item.status === 'New').length,
        reopen: projectWorkItems.filter(item => 
          item.status === 'Removed' || 
          item.status === 'Reopened' || 
          item.status === 'Reopen' ||
          item.status === 'Rejected' ||
          item.status.toLowerCase().includes('reopen')
        ).length,
        critical: projectWorkItems.filter(item => item.priority === 'Critical').length,
        high: projectWorkItems.filter(item => item.priority === 'High').length,
        medium: projectWorkItems.filter(item => item.priority === 'Medium').length,
        low: projectWorkItems.filter(item => item.priority === 'Low').length,
        completionRate: projectWorkItems.length > 0 
          ? Math.round(((projectWorkItems.filter(item => item.status === 'Closed' || item.status === 'Resolved').length) / projectWorkItems.length) * 100)
          : 0,
        priorityScore: (
          projectWorkItems.filter(item => item.priority === 'Critical').length * 4 +
          projectWorkItems.filter(item => item.priority === 'High').length * 3 +
          projectWorkItems.filter(item => item.priority === 'Medium').length * 2 +
          projectWorkItems.filter(item => item.priority === 'Low').length * 1
        )
      };
    });
  };

  const projectReports = generateProjectReports();

  // Filter and sort reports
  const filteredReports = projectReports
    .filter(report => 
      report.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'completed':
          aValue = a.closed + a.resolved;
          bValue = b.closed + b.resolved;
          break;
        case 'priority':
          aValue = a.priorityScore;
          bValue = b.priorityScore;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (column: 'name' | 'total' | 'completed' | 'priority') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Calculate totals
  const totals = filteredReports.reduce((acc, report) => ({
    total: acc.total + report.total,
    closed: acc.closed + report.closed,
    resolved: acc.resolved + report.resolved,
    active: acc.active + report.active,
    todo: acc.todo + report.todo,
    critical: acc.critical + report.critical,
    high: acc.high + report.high,
    medium: acc.medium + report.medium,
    low: acc.low + report.low
  }), {
    total: 0, closed: 0, resolved: 0, active: 0, todo: 0,
    critical: 0, high: 0, medium: 0, low: 0
  });

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 shadow-2xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">Project Reports</h2>
              <p className="text-gray-600 font-medium">Comprehensive project analysis and metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'summary' | 'detailed' | 'priority')}
              className="px-3 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="priority">Priority Analysis</option>
            </select>
            <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Showing {filteredReports.length} of {projectReports.length} projects
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50">
            <div className="text-2xl font-medium text-blue-900">{totals.total}</div>
            <p className="text-sm text-blue-700">Total Work Items</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50">
            <div className="text-2xl font-medium text-green-900">{totals.closed + totals.resolved}</div>
            <p className="text-sm text-green-700">Completed Items</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50">
            <div className="text-2xl font-medium text-orange-900">{totals.critical + totals.high}</div>
            <p className="text-sm text-orange-700">High Priority</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50">
            <div className="text-2xl font-medium text-purple-900">
              {totals.total > 0 ? Math.round(((totals.closed + totals.resolved) / totals.total) * 100) : 0}%
            </div>
            <p className="text-sm text-purple-700">Overall Completion</p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            {reportType === 'summary' && 'Project Summary Report'}
            {reportType === 'detailed' && 'Detailed Status Breakdown'}
            {reportType === 'priority' && 'Priority Analysis Report'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Project Name</span>
                    {sortBy === 'name' && (
                      <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Items</span>
                    {sortBy === 'total' && (
                      <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                
                {reportType === 'summary' && (
                  <>
                    <th 
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('completed')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Completed</span>
                        {sortBy === 'completed' && (
                          <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </>
                )}

                {reportType === 'detailed' && (
                  <>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closed</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Do</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reopen</th>
                  </>
                )}

                {reportType === 'priority' && (
                  <>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Critical</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                    <th 
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Priority Score</span>
                        {sortBy === 'priority' && (
                          <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report, index) => (
                <tr key={report.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {report.total}
                  </td>
                  
                  {reportType === 'summary' && (
                    <>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 font-medium">
                        {report.closed + report.resolved}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 h-1 mr-2">
                            <div 
                              className={`h-1 ${
                                report.completionRate >= 80 ? 'bg-green-500' :
                                report.completionRate >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${report.completionRate}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${
                            report.completionRate >= 80 ? 'text-green-600' :
                            report.completionRate >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {report.completionRate}%
                          </span>
                        </div>
                      </td>
                    </>
                  )}

                  {reportType === 'detailed' && (
                    <>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">{report.closed}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-green-500">{report.resolved}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-600">{report.active}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600">{report.todo}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-purple-600">{report.new}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">{report.reopen}</td>
                    </>
                  )}

                  {reportType === 'priority' && (
                    <>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600 font-medium">{report.critical}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-orange-600 font-medium">{report.high}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-600">{report.medium}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">{report.low}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-purple-600 font-medium">{report.priorityScore}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No projects found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectReports;