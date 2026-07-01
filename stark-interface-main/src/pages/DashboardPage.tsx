import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Network, 
  Shield, 
  Activity, 
  TrendingUp,
  Clock,
  Zap,
  Rocket
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJarvisStore } from '@/store/jarvisStore';
import { extremeStressSimulator } from '@/utils/extremeStressSimulator';

// Selector pattern to only subscribe to what we need
const useDashboardState = () => {
  const metrics = useJarvisStore(state => state.metrics);
  const dashboard = useJarvisStore(state => state.dashboard);
  const setDashboardTimeRange = useJarvisStore(state => state.setDashboardTimeRange);
  const addMetricDataPoint = useJarvisStore(state => state.addMetricDataPoint);
  
  return { metrics, dashboard, setDashboardTimeRange, addMetricDataPoint };
};

const DashboardPage: React.FC = () => {
  const { metrics, dashboard, setDashboardTimeRange } = useDashboardState();
  
  const stats = [
    { label: 'CPU Usage', value: `${metrics.cpu}%`, icon: <Cpu className="w-5 h-5" />, trend: '+2%', color: 'text-blue-400' },
    { label: 'Network I/O', value: `${(metrics.network / 1000).toFixed(1)} GB/s`, icon: <Network className="w-5 h-5" />, trend: '+15%', color: 'text-green-400' },
    { label: 'Security Score', value: '98/100', icon: <Shield className="w-5 h-5" />, trend: '0%', color: 'text-cyan-400' },
    { label: 'Active Connections', value: `${metrics.activeConnections}`, icon: <Activity className="w-5 h-5" />, trend: '-3', color: 'text-yellow-400' },
  ];

  const recentActivities = [
    { time: '02:45:12', action: 'System scan completed', status: 'success' },
    { time: '02:30:00', action: 'Security patch applied', status: 'success' },
    { time: '02:15:33', action: 'Network latency spike detected', status: 'warning' },
    { time: '02:00:00', action: 'Backup process initiated', status: 'running' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Command Dashboard</h1>
            <p className="text-slate-400">Real-time systems overview and operational metrics</p>
          </div>
          <div className="flex items-center gap-4">
            {/* EXTREME STRESS TEST BUTTON */}
            <Button
              onClick={() => {
                if (confirm('⚠️ WARNING: This will push your system to EXTREME limits. All AI agents (Hermes, Ruflo, Goose) will be spammed with load. Continue?')) {
                  extremeStressSimulator.start();
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Rocket className="w-4 h-4" />
              EXTREME STRESS TEST
            </Button>
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 mr-2">Time Range:</span>
              {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDashboardTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm transition-all ${
                    dashboard.selectedTimeRange === range
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {stats.map((stat, index) => (
          <Card key={stat.label} className="bg-slate-900/50 border-slate-800 p-5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-slate-800 ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* System Health */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">System Health</h2>
              <span className="flex items-center gap-2 text-xs text-green-400">
                <Zap className="w-4 h-4" /> All systems operational
              </span>
            </div>
            <div className="space-y-4">
              {['Quantum Core', 'Neural Network', 'Security Mesh', 'Data Fabric'].map((system, i) => (
                <div key={system} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{system}</span>
                    <span className="text-cyan-400">{95 + i}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${95 + i}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="bg-slate-900/50 border-slate-800 p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                  <span className="text-xs font-mono text-slate-500 whitespace-nowrap">{activity.time}</span>
                  <div>
                    <p className="text-sm text-slate-200">{activity.action}</p>
                    <span className={`text-xs ${
                      activity.status === 'success' ? 'text-green-400' :
                      activity.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {activity.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;