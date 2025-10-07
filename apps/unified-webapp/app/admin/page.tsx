'use client';

import { useState, useEffect } from 'react';
import { monitoring } from '../lib/monitoring';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [moduleStats, setModuleStats] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load recent data
    setLogs(monitoring.getRecentLogs(20));
    setMetrics(monitoring.getRecentMetrics(20));
    setModuleStats(monitoring.getModuleStats());

    // Set up periodic refresh
    const interval = setInterval(() => {
      setLogs(monitoring.getRecentLogs(20));
      setMetrics(monitoring.getRecentMetrics(20));
      setModuleStats(monitoring.getModuleStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring and logging dashboard</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Logs</p>
                <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Errors</p>
                <p className="text-2xl font-semibold text-gray-900">{monitoring.getErrorCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚡</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Metrics</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Modules</p>
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(moduleStats).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Logs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{log.module}</span>
                          </div>
                          <p className="text-sm text-gray-900 mt-1">{log.message}</p>
                          {log.metadata && (
                            <pre className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No logs available</p>
                )}
              </div>
            </div>
          </div>

          {/* Module Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Module Statistics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(moduleStats).map(([module, stats]) => (
                  <div key={module} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{module}</span>
                      <div className="flex space-x-4">
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Info: {stats.info}
                        </span>
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          Warn: {stats.warn}
                        </span>
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Error: {stats.error}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Performance Metrics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.slice(0, 6).map((metric, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {metric.value.toFixed(2)}{metric.unit}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {metric.tags && (
                    <div className="mt-2">
                      {Object.entries(metric.tags).map(([key, value]) => (
                        <span key={key} className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mr-1">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}