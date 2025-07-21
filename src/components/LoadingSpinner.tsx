import React from 'react';
import { Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Activity className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">{message}</p>
        <p className="mt-2 text-sm text-gray-500">Fetching data from Azure DevOps...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;