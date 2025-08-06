import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { state, connectAWS, disconnectAWS } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showAWSForm, setShowAWSForm] = useState(false);
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  });

  const handleAWSConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await connectAWS(awsCredentials);
      setShowAWSForm(false);
      setAwsCredentials({ accessKeyId: '', secretAccessKey: '', region: 'us-east-1' });
    } catch (error) {
      console.error('Failed to connect AWS:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectAWS = () => {
    disconnectAWS();
  };

  return (
    <div className="lg:pl-64 min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="space-y-8">
            {/* AWS Configuration */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">AWS Configuration</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Connect your AWS account to get real-time cost data and personalized recommendations.
                </p>
              </div>
              <div className="p-6">
                {state.awsConnected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">AWS Account Connected</p>
                        <p className="text-sm text-gray-600">Real-time data is being used for analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectAWS}
                      className="btn-secondary"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    {!showAWSForm ? (
                      <div className="text-center py-6">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 mb-4">
                          Currently using demo data. Connect your AWS account for real insights.
                        </p>
                        <button
                          onClick={() => setShowAWSForm(true)}
                          className="btn-primary"
                        >
                          Connect AWS Account
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleAWSConnect} className="space-y-4">
                        <div>
                          <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700">
                            Access Key ID
                          </label>
                          <input
                            type="text"
                            id="accessKeyId"
                            value={awsCredentials.accessKeyId}
                            onChange={(e) => setAwsCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
                            className="mt-1 input-field"
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700">
                            Secret Access Key
                          </label>
                          <input
                            type="password"
                            id="secretAccessKey"
                            value={awsCredentials.secretAccessKey}
                            onChange={(e) => setAwsCredentials(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                            className="mt-1 input-field"
                            placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                            Default Region
                          </label>
                          <select
                            id="region"
                            value={awsCredentials.region}
                            onChange={(e) => setAwsCredentials(prev => ({ ...prev, region: e.target.value }))}
                            className="mt-1 input-field"
                          >
                            <option value="us-east-1">US East (N. Virginia)</option>
                            <option value="us-west-2">US West (Oregon)</option>
                            <option value="eu-west-1">Europe (Ireland)</option>
                            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                          </select>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex items-center"
                          >
                            {isLoading && <LoadingSpinner size="small" color="white" className="mr-2" />}
                            {isLoading ? 'Connecting...' : 'Connect'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAWSForm(false)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your AWS credentials are stored securely and only used to fetch cost data. 
                            We recommend using IAM roles with minimal required permissions.
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Configure how you'd like to receive cost optimization reports.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                    <p className="text-sm text-gray-600">Receive weekly cost optimization summaries</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={user?.preferences.emailNotifications}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Cost Alerts</h3>
                    <p className="text-sm text-gray-600">Get notified when costs exceed thresholds</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label htmlFor="costThreshold" className="block text-sm font-medium text-gray-700">
                    Cost Threshold ($)
                  </label>
                  <input
                    type="number"
                    id="costThreshold"
                    defaultValue={user?.preferences.costThreshold || 1000}
                    className="mt-1 input-field w-32"
                    min="0"
                    step="50"
                  />
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      defaultValue={user?.firstName}
                      className="mt-1 input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      defaultValue={user?.lastName}
                      className="mt-1 input-field"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    defaultValue={user?.email}
                    className="mt-1 input-field"
                  />
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    defaultValue={user?.preferences.timeZone}
                    className="mt-1 input-field"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;