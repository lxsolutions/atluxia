// Monitoring and logging utilities

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  module: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

class MonitoringService {
  private logs: LogEntry[] = [];
  private metrics: PerformanceMetric[] = [];
  private maxLogs = 1000; // Keep only recent logs

  log(level: LogEntry['level'], message: string, module: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      module,
      metadata
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogging(entry);
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logMethod(`[${module}] ${level.toUpperCase()}: ${message}`, metadata);
    }
  }

  info(message: string, module: string, metadata?: Record<string, any>) {
    this.log('info', message, module, metadata);
  }

  warn(message: string, module: string, metadata?: Record<string, any>) {
    this.log('warn', message, module, metadata);
  }

  error(message: string, module: string, metadata?: Record<string, any>) {
    this.log('error', message, module, metadata);
  }

  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);

    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalMonitoring(metric);
    }
  }

  private sendToExternalLogging(entry: LogEntry) {
    // TODO: Integrate with external logging service (e.g., Sentry, LogRocket)
    // For now, just log to console in production
    const logMethod = entry.level === 'error' ? console.error : entry.level === 'warn' ? console.warn : console.log;
    logMethod(`[PRODUCTION][${entry.module}] ${entry.level.toUpperCase()}: ${entry.message}`, entry.metadata);
  }

  private sendToExternalMonitoring(metric: PerformanceMetric) {
    // TODO: Integrate with external monitoring service (e.g., Datadog, New Relic)
    console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit}`, metric.tags);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  getRecentMetrics(count: number = 50): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  getErrorCount(): number {
    return this.logs.filter(log => log.level === 'error').length;
  }

  getModuleStats(): Record<string, { info: number; warn: number; error: number }> {
    const stats: Record<string, { info: number; warn: number; error: number }> = {};

    this.logs.forEach(log => {
      if (!stats[log.module]) {
        stats[log.module] = { info: 0, warn: 0, error: 0 };
      }
      stats[log.module][log.level]++;
    });

    return stats;
  }
}

// Global monitoring service instance
export const monitoring = new MonitoringService();

// Performance monitoring utilities
export function measurePerformance<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
  const startTime = performance.now();
  
  try {
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    monitoring.recordMetric(name, duration, 'ms', tags);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    monitoring.recordMetric(`${name}_error`, duration, 'ms', { ...tags, error: 'true' });
    throw error;
  }
}

export async function measurePerformanceAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    monitoring.recordMetric(name, duration, 'ms', tags);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    monitoring.recordMetric(`${name}_error`, duration, 'ms', { ...tags, error: 'true' });
    throw error;
  }
}