import React, { useState } from 'react';
import { Key, User, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionSetupProps {
  onConnect: (pat: string) => void;
  isConnecting: boolean;
  error?: string;
}

const ConnectionSetup: React.FC<ConnectionSetupProps> = ({ onConnect, isConnecting, error }) => {
  const [personalAccessToken, setPersonalAccessToken] = useState(import.meta.env.VITE_PAT_AZUREDEVOPS || '');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (personalAccessToken.trim()) {
      onConnect(personalAccessToken.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect to Azure DevOps</h1>
          <p className="text-gray-600">Enter your Personal Access Token to connect to NSSO-V1 organization</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Organization</p>
              <p className="text-sm text-blue-700">https://dev.azure.com/NSSO-V1/</p>
              <p className="text-sm text-blue-700 mt-1">Username: pratik.banerjee@tuteck.com</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Connection Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pat" className="block text-sm font-medium text-gray-700 mb-2">
              Personal Access Token
            </label>
            <div className="relative">
              <input
                id="pat"
                type={showToken ? 'text' : 'password'}
                value={personalAccessToken}
                onChange={(e) => setPersonalAccessToken(e.target.value)}
                placeholder="Enter your Azure DevOps PAT"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={isConnecting}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isConnecting}
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!personalAccessToken.trim() || isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              'Connect to Azure DevOps'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">How to get your PAT:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Go to Azure DevOps → User Settings → Personal Access Tokens</li>
            <li>2. Click "New Token"</li>
            <li>3. Select scopes: Work Items (Read) and Project and Team (Read)</li>
            <li>4. Copy the generated token</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSetup;