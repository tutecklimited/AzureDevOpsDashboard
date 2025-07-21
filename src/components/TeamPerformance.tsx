import React, { useState, useMemo } from 'react';
import { Users, Trophy, Clock, Target, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkItem, ProjectMetrics } from '../types';

interface TeamPerformanceProps {
  workItems: WorkItem[];
  projectMetrics: ProjectMetrics[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ 
  workItems, 
  projectMetrics, 
  onRefresh, 
  isRefreshing 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate team performance metrics
  const teamMetrics = useMemo(() => {
    const assigneeMap = new Map();
    
    workItems.forEach(item => {
      if (!item.assignedTo || item.assignedTo === 'Unassigned') return;
      
      if (!assigneeMap.has(item.assignedTo)) {
        assigneeMap.set(item.assignedTo, {
          name: item.assignedTo,
          totalItems: 0,
          completedItems: 0,
          activeItems: 0,
          avgResolutionTime: 0,
          projects: new Set()
        });
      }
      
      const assignee = assigneeMap.get(item.assignedTo);
      assignee.totalItems++;
      assignee.projects.add(item.project);
      
      if (item.status === 'Closed' || item.status === 'Resolved') {
        assignee.completedItems++;
      } else if (item.status === 'To Do' || item.status === 'Doing' || item.status === 'Active') {
        assignee.activeItems++;
      }
    });
    
    return Array.from(assigneeMap.values()).map(assignee => ({
      ...assignee,
      completionRate: assignee.totalItems > 0 ? (assignee.completedItems / assignee.totalItems) * 100 : 0,
      projectCount: assignee.projects.size,
      efficiency: assignee.totalItems > 0 ? assignee.completedItems / assignee.totalItems : 0
    })).sort((a, b) => b.completionRate - a.completionRate);
  }, [workItems]);

  // Filter team members based on search term
  const filteredTeamMetrics = useMemo(() => {
    if (!searchTerm) return teamMetrics;
    return teamMetrics.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMetrics, searchTerm]);

  // Reset to page 1 when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTeamMetrics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTeamMetrics = filteredTeamMetrics.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Calculate overall team stats
  const overallStats = useMemo(() => {
    const totalMembers = teamMetrics.length;
    const avgCompletionRate = teamMetrics.reduce((sum, member) => sum + member.completionRate, 0) / (totalMembers || 1);
    const totalActiveItems = teamMetrics.reduce((sum, member) => sum + member.activeItems, 0);
    const totalCompletedItems = teamMetrics.reduce((sum, member) => sum + member.completedItems, 0);
    
    return {
      totalMembers,
      avgCompletionRate,
      totalActiveItems,
      totalCompletedItems
    };
  }, [teamMetrics]);

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Team Members</p>
              <p className="text-2xl font-bold text-blue-900">{overallStats.totalMembers}</p>
              <p className="text-xs font-medium text-gray-500">Active contributors</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
              <p className="text-2xl font-bold text-green-900">{overallStats.avgCompletionRate.toFixed(1)}%</p>
              <p className="text-xs font-medium text-gray-500">Team performance</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Work Items</p>
              <p className="text-2xl font-bold text-orange-900">{overallStats.totalActiveItems}</p>
              <p className="text-xs font-medium text-gray-500">In progress</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 p-4 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Items</p>
              <p className="text-2xl font-bold text-purple-900">{overallStats.totalCompletedItems}</p>
              <p className="text-xs font-medium text-gray-500">Total delivered</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Team Performance Table */}
      <div className="bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Detailed Team Performance</h3>
              <p className="text-sm text-gray-600">Individual contributor metrics and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTeamMetrics.length > 0 ? (
                currentTeamMetrics.map((member, index) => (
                  <tr key={member.name} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center mr-3">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.totalItems}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 font-medium">{member.completedItems}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-orange-600 font-medium">{member.activeItems}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-2">{member.completionRate.toFixed(1)}%</div>
                        <div className="w-16 bg-gray-200 h-1">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-1" 
                            style={{ width: `${Math.min(member.completionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.projectCount}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        member.completionRate >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : member.completionRate >= 60 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.completionRate >= 80 ? 'Excellent' : member.completionRate >= 60 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? `No team members found matching "${searchTerm}"` : 'No team members found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTeamMetrics.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTeamMetrics.length)} of {filteredTeamMetrics.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPerformance;