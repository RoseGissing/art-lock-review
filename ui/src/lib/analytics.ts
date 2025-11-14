interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface UserAction {
  action: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

class Analytics {
  private metrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private maxEntries = 1000;

  // Performance monitoring
  measurePerformance(name: string, fn: () => Promise<void> | void, context?: Record<string, any>) {
    const startTime = performance.now();

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          this.recordMetric(name, endTime - startTime, context);
        });
      } else {
        const endTime = performance.now();
        this.recordMetric(name, endTime - startTime, context);
      }
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`${name}_error`, endTime - startTime, { ...context, error: error.message });
      throw error;
    }
  }

  private recordMetric(name: string, value: number, context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.maxEntries) {
      this.metrics = this.metrics.slice(-this.maxEntries);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('performance', metric);
    }
  }

  // User action tracking
  trackAction(action: string, metadata?: Record<string, any>) {
    const userAction: UserAction = {
      action,
      timestamp: Date.now(),
      metadata,
    };

    this.userActions.push(userAction);

    if (this.userActions.length > this.maxEntries) {
      this.userActions = this.userActions.slice(-this.maxEntries);
    }

    // Send to analytics service
    this.sendToAnalytics('user_action', userAction);
  }

  // Contract interaction monitoring
  trackContractCall(contractName: string, methodName: string, gasUsed?: number) {
    this.trackAction('contract_call', {
      contract: contractName,
      method: methodName,
      gasUsed,
    });
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>) {
    this.trackAction('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  // Get analytics data
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getUserActions(): UserAction[] {
    return [...this.userActions];
  }

  getAverageMetric(name: string, timeRange?: number): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);

    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      relevantMetrics.filter(m => m.timestamp >= cutoff);
    }

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  // Analytics service integration
  private sendToAnalytics(type: string, data: any) {
    // In production, replace with actual analytics service
    if (process.env.VITE_GA_TRACKING_ID) {
      // Google Analytics integration
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', type, {
          custom_parameter: JSON.stringify(data),
        });
      }
    }

    // Could also send to custom analytics endpoint
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ type, data }) });
  }

  // Dashboard data
  getDashboardData() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    return {
      performance: {
        averagePageLoad: this.getAverageMetric('page_load', last24h),
        averageApiCall: this.getAverageMetric('api_call', last24h),
        errorRate: this.userActions.filter(a => a.action === 'error').length / Math.max(this.userActions.length, 1),
      },
      usage: {
        totalActions: this.userActions.length,
        contractCalls: this.userActions.filter(a => a.action === 'contract_call').length,
        uniqueUsers: new Set(this.userActions.map(a => a.userId).filter(Boolean)).size,
      },
      recentErrors: this.userActions
        .filter(a => a.action === 'error')
        .slice(-10)
        .reverse(),
    };
  }
}

export const analytics = new Analytics();

// Performance measurement HOC
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return (props: P) => {
    React.useEffect(() => {
      analytics.measurePerformance(`${componentName}_render`, () => {
        // Component render time tracking
      });
    }, []);

    return <Component {...props} />;
  };
}
