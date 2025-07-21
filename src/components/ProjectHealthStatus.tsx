import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectMetrics } from '../types';

interface ProjectHealthStatusProps {
  projects: ProjectMetrics[];
}

const ProjectHealthStatus: React.FC<ProjectHealthStatusProps> = ({ projects }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  const getHealthStatus = (project: ProjectMetrics) => {
    const resolutionRate = project.totalWorkItems > 0 
      ? (project.resolvedWorkItems / project.totalWorkItems) * 100 
      : 0;
    
    if (resolutionRate >= 80) return { status: 'Excellent', color: 'green', icon: CheckCircle };
    if (resolutionRate >= 60) return { status: 'Good', color: 'yellow', icon: AlertTriangle };
    return { status: 'Needs Attention', color: 'red', icon: XCircle };
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {currentProjects.map((project) => {
          const health = getHealthStatus(project);
          const Icon = health.icon;
          const resolutionRate = project.totalWorkItems > 0 
            ? Math.round((project.resolvedWorkItems / project.totalWorkItems) * 100)
            : 0;

          return (
            <div
              key={project.projectName}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate text-sm">{project.projectName}</h3>
                <div className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium ${
                  health.color === 'green' ? 'bg-green-100 text-green-800' :
                  health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <Icon className="h-3 w-3" />
                  <span>{health.status}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{project.totalWorkItems}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Resolved:</span>
                  <span className="font-medium text-green-600">{project.resolvedWorkItems}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Resolution Rate:</span>
                  <span className="font-medium">{resolutionRate}%</span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 h-1">
                  <div 
                    className={`h-1 transition-all duration-300 ${
                      health.color === 'green' ? 'bg-green-500' :
                      health.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${resolutionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, projects.length)} of {projects.length} projects
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHealthStatus;