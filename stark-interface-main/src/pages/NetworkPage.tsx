import React from 'react';
import { motion } from 'framer-motion';
import { Network, Wifi, Globe, Server, Upload, Download, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJarvisStore } from '@/store/jarvisStore';

// Selector pattern for Network page
const useNetworkState = () => {
  const metrics = useJarvisStore(state => state.metrics);
  const network = useJarvisStore(state => state.network);
  const addPacketEntry = useJarvisStore(state => state.addPacketEntry);
  
  return { metrics, network, addPacketEntry };
};

const NetworkPage: React.FC = () => {
  const { metrics, network } = useNetworkState();
  
  const activeConnections = [
    { name: 'Local Mesh', latency: '2ms', status: 'optimal', type: 'local' },
    { name: 'Cloud Node US-East', latency: '45ms', status: 'good', type: 'cloud' },
    { name: 'Cloud Node EU-West', latency: '89ms', status: 'good', type: 'cloud' },
    { name: 'VPN Tunnel Singapore', latency: '156ms', status: 'warning', type: 'vpn' },
  ];

  const bandwidth = {
    upload: Math.round(metrics.network * 0.45),
    download: Math.round(metrics.network * 0.89),
    maxUpload: 1000,
    maxDownload: 1000,
  };

  const networkAlerts = [
    { id: 1, type: 'warning', message: 'High latency detected on Singapore node', time: '5m ago' },
    { id: 2, type: 'info', message: 'New connection established: Quantum Proxy', time: '12m ago' },
    { id: 3, type: 'success', message: 'Load balancer reconfiguration complete', time: '1h ago' },
  ];

  const connectedNodes = [
    { name: 'jarvis-core-01', ip: '192.168.1.101', status: 'online' },
    { name: 'edge-proxy-03', ip: '192.168.1.104', status: 'online' },
    { name: 'storage-node-07', ip: '192.168.1.107', status: 'online' },
    { name: 'ai-accelerator-02', ip: '192.168.1.112', status: 'online' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Network Operations</h1>
        <p className="text-slate-400">Bandwidth monitoring, connection health, and node management</p>
      </motion.div>

      {/* Bandwidth Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-medium">Download Speed</h3>
              <p className="text-3xl font-bold text-green-400 font-mono">{bandwidth.download} <span className="text-lg">Mbps</span></p>
            </div>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(bandwidth.download / bandwidth.maxDownload) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            />
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-medium">Upload Speed</h3>
              <p className="text-3xl font-bold text-blue-400 font-mono">{bandwidth.upload} <span className="text-lg">Mbps</span></p>
            </div>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(bandwidth.upload / bandwidth.maxUpload) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            />
          </div>
        </Card>
      </motion.div>

      {/* Connection Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-cyan-400" />
              Active Connections
            </h2>
            <div className="space-y-3">
              {activeConnections.map((conn) => (
                <div key={conn.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{conn.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-400">{conn.latency}</span>
                    <Badge variant="secondary" className={
                      conn.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                      conn.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {conn.status}
                    </Badge>
                  </div>
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
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Network Alerts
            </h2>
            <div className="space-y-3">
              {networkAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                  <span className={`mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-400' :
                    alert.type === 'success' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-200">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Connected Nodes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Connected Nodes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {connectedNodes.map((node) => (
              <div key={node.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white font-medium">{node.name}</span>
                </div>
                <p className="text-xs font-mono text-slate-500">{node.ip}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default NetworkPage;