import React from 'react';
import { ChevronDown, Folder, FolderOpen } from 'lucide-react';

interface ProjectSelectorProps {
  selectedProject: string;
  onProjectChange: (project: string) => void;
  projects: string[];
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onProjectChange,
  projects
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {selectedProject === 'all' ? (
          <FolderOpen className="h-4 w-4 text-blue-600" />
        ) : (
          <Folder className="h-4 w-4 text-blue-600" />
        )}
        <span className="text-sm font-medium text-gray-700">Project:</span>
      </div>
      
      <div className="relative">
        <select
          value={selectedProject}
          onChange={(e) => onProjectChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 pr-8 min-w-[200px] shadow-sm hover:shadow-md transition-all duration-300"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        {selectedProject === 'all' 
          ? `Showing all ${projects.length} projects`
          : `Showing: ${selectedProject}`
        }
      </div>
    </div>
  );
};

export default ProjectSelector;