import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Pause, Square, RefreshCw, List, GitBranch, Clock, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useJarvisStore } from '@/store/jarvisStore';

// Selector pattern for Ops page
const useOpsState = () => {
  const ops = useJarvisStore(state => state.ops);
  const setSelectedAgent = useJarvisStore(state => state.setSelectedAgent);
  const setTaskFilter = useJarvisStore(state => state.setTaskFilter);
  
  return { ops, setSelectedAgent, setTaskFilter };
};

const OpsPage: React.FC = () => {
  const { ops, setSelectedAgent, setTaskFilter } = useOpsState();
  
  const activeAgents = [
    { name: 'JARVIS Core', status: 'running', role: 'Primary Assistant', uptime: '14d 7h 32m', cpu: 12.4, id: 'jarvis' },
    { name: 'Hermes', status: 'running', role: 'Communication', uptime: '14d 7h 30m', cpu: 3.2, id: 'hermes' },
    { name: 'Ruflo', status: 'idle', role: 'File Operations', uptime: '0s', cpu: 0, id: 'rufolo' },
  ];

  const taskQueue = [
    { id: 'task-001', name: 'System Health Scan', status: 'running', progress: 67, agent: 'JARVIS Core', eta: '2m 30s' },
    { id: 'task-002', name: 'Security Log Analysis', status: 'queued', progress: 0, agent: 'pending', eta: '5m 00s' },
    { id: 'task-003', name: 'Database Backup', status: 'queued', progress: 0, agent: 'pending', eta: '15m 00s' },
    { id: 'task-004', name: 'Neural Model Fine-tuning', status: 'completed', progress: 100, agent: 'JARVIS Core', completed: '32m ago' },
  ];

  const workflows = [
    { name: 'Daily Maintenance', triggers: '04:00 UTC', status: 'scheduled', lastRun: '24h ago' },
    { name: 'Security Audit', triggers: 'Weekly (Sunday)', status: 'scheduled', lastRun: '3d ago' },
    { name: 'Performance Benchmark', triggers: 'On Demand', status: 'idle', lastRun: '7d ago' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Operations Center</h1>
            <p className="text-slate-400">Agent management, task orchestration, and workflow automation</p>
          </div>
          {/* Agent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 mr-2">Filter by Agent:</span>
            {(['all', 'hermes', 'rufolo', 'jarvis'] as const).map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  ops.selectedAgent === agent
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {agent.charAt(0).toUpperCase() + agent.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Active Agents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Active AI Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeAgents.map((agent) => (
              <div key={agent.name} className="p-5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{agent.name}</h3>
                  <Badge className={agent.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-4">{agent.role}</p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uptime</span>
                    <span className="text-cyan-400">{agent.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CPU</span>
                    <span className="text-cyan-400">{agent.cpu}%</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="secondary" className="flex-1">
                    {agent.status === 'running' ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                    {agent.status === 'running' ? 'Pause' : 'Start'}
                  </Button>
                  <Button size="sm" variant="secondary">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <List className="w-5 h-5 text-yellow-400" />
              Task Queue
            </h2>
            <div className="space-y-4">
              {taskQueue.map((task) => (
                <div key={task.id} className="p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{task.name}</p>
                      <p className="text-xs text-slate-500">Assigned: {task.agent}</p>
                    </div>
                    <Badge className={
                      task.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                  {task.status === 'running' && (
                    <>
                      <Progress value={task.progress} className="h-2 bg-slate-700 mb-2" />
                      <p className="text-xs text-slate-500">ETA: {task.eta}</p>
                    </>
                  )}
                  {task.status === 'completed' && (
                    <p className="text-xs text-green-500">Completed {task.completed}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              Automated Workflows
            </h2>
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div>
                    <p className="text-white font-medium">{workflow.name}</p>
                    <p className="text-xs text-slate-500">Triggers: {workflow.triggers}</p>
                    <p className="text-xs text-slate-500">Last run: {workflow.lastRun}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400">{workflow.status}</Badge>
                    <Button size="sm" variant="secondary">
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Operations Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-xs text-slate-400">Tasks Running</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <List className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-slate-400">Tasks Queued</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-slate-400">Agents Active</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-xs text-slate-400">Workflows Configured</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default OpsPage;