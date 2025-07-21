import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProjectHealthChartProps {
  data: Array<{
    name: string;
    totalWorkItems: number;
    resolved: number;
    todo: number;
    reopen: number;
  }>;
}

const ProjectHealthChart: React.FC<ProjectHealthChartProps> = ({ data }) => {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-medium bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Project Health Overview
          </h2>
          <p className="text-gray-600 text-sm">Work items distribution by project</p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="resolved" 
              fill="#10b981" 
              name="Resolved"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="todo" 
              fill="#3b82f6" 
              name="To Do"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="reopen" 
              fill="#ef4444" 
              name="Reopen"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectHealthChart;