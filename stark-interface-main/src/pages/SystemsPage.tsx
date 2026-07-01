import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Thermometer, Gauge, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useJarvisStore } from '@/store/jarvisStore';

// Selector pattern for Systems page
const useSystemsState = () => {
  const metrics = useJarvisStore(state => state.metrics);
  const systems = useJarvisStore(state => state.systems);
  const setProcessPriority = useJarvisStore(state => state.setProcessPriority);
  
  return { metrics, systems, setProcessPriority };
};

const SystemsPage: React.FC = () => {
  const { metrics } = useSystemsState();
  
  const systemResources = [
    { name: 'CPU', value: metrics.cpu, max: 100, unit: '%', icon: <Cpu className="w-5 h-5" /> },
    { name: 'Memory', value: metrics.memory, max: 100, unit: '%', icon: <MemoryStick className="w-5 h-5" /> },
    { name: 'Storage', value: 34, max: 100, unit: '%', icon: <HardDrive className="w-5 h-5" /> },
    { name: 'GPU', value: 28, max: 100, unit: '%', icon: <Gauge className="w-5 h-5" /> },
  ];

  const temperatures = [
    { name: 'CPU Core', value: metrics.temperature, unit: '°C', threshold: 80 },
    { name: 'GPU Die', value: 72, unit: '°C', threshold: 85 },
    { name: 'System', value: 42, unit: '°C', threshold: 60 },
  ];

  const processes = [
    { name: 'jarvis-core', pid: '1042', cpu: 12.4, memory: 8.2, status: 'running' },
    { name: 'neural-engine', pid: '1087', cpu: 8.1, memory: 15.7, status: 'running' },
    { name: 'security-mesh', pid: '1156', cpu: 3.2, memory: 4.1, status: 'running' },
    { name: 'quantum-proxy', pid: '1201', cpu: 5.7, memory: 6.3, status: 'sleeping' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Systems Management</h1>
        <p className="text-slate-400">Hardware monitoring, resource allocation, and process management</p>
      </motion.div>

      {/* Resources Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {systemResources.map((resource) => (
          <Card key={resource.name} className="bg-slate-900/50 border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                {resource.icon}
              </div>
              <span className="text-white font-medium">{resource.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Usage</span>
                <span className="text-cyan-400 font-mono">{resource.value}{resource.unit}</span>
              </div>
              <Progress value={resource.value} className="h-2 bg-slate-800" />
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Temperature and Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              Temperature Readings
            </h2>
            <div className="space-y-6">
              {temperatures.map((temp) => (
                <div key={temp.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{temp.name}</span>
                    <span className={`font-mono ${temp.value > temp.threshold * 0.8 ? 'text-red-400' : 'text-green-400'}`}>
                      {temp.value}{temp.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(temp.value / temp.threshold) * 100} 
                    className={`h-3 ${temp.value > temp.threshold * 0.8 ? 'bg-red-500' : 'bg-green-500'}`}
                  />
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
              <Power className="w-5 h-5 text-green-400" />
              Active Processes
            </h2>
            <div className="space-y-3">
              {processes.map((proc) => (
                <div key={proc.pid} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium text-white">{proc.name}</p>
                    <p className="text-xs text-slate-500">PID: {proc.pid}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">CPU: {proc.cpu}% | MEM: {proc.memory}GB</p>
                    <span className="text-xs text-green-400 uppercase">{proc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemsPage;