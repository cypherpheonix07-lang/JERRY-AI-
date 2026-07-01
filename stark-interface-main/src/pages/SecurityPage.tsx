import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, FileText, Lock, Unlock, Eye, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useJarvisStore } from '@/store/jarvisStore';

// Selector pattern for Security page
const useSecurityState = () => {
  const security = useJarvisStore(state => state.security);
  
  return { security };
};

const SecurityPage: React.FC = () => {
  const { security } = useSecurityState();
  
  // Convert guardrailStatus object to properly formatted array for rendering
  const guardrails = Object.entries(security.guardrailStatus || {}).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Convert camelCase to readable string
    status: value ? 'active' : 'inactive',
    layer: 'AI Content Safety',
  }));

  const recentAlerts = [
    { id: 1, severity: 'low', message: 'Unusual login pattern detected from new IP', time: '15m ago', source: 'auth' },
    { id: 2, severity: 'medium', message: 'Input validation triggered - potential injection attempt blocked', time: '32m ago', source: 'input-sanitizer' },
    { id: 3, severity: 'low', message: 'Model output scanned - no policy violations', time: '1h ago', source: 'output-validator' },
    { id: 4, severity: 'info', message: 'Security scan completed - all systems clear', time: '2h ago', source: 'audit-logger' },
  ];

  const auditLogs = [
    { timestamp: '14:32:45', action: 'model_call', user: 'system', model: 'claude-sonnet-4', status: 'allowed' },
    { timestamp: '14:31:12', action: 'authentication', user: 'phanindra', ip: '192.168.1.105', status: 'success' },
    { timestamp: '14:28:55', action: 'input_validated', user: 'phanindra', chars: 1247, status: 'clean' },
    { timestamp: '14:25:33', action: 'output_scanned', user: 'system', tokens: 892, status: 'compliant' },
  ];

  const threatLevel = 12; // out of 100

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Security Command Center</h1>
        <p className="text-slate-400">5-layer security pipeline monitoring, threat detection, and audit logs</p>
      </motion.div>

      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-800" />
                  <motion.circle
                    cx="64" cy="64" r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${threatLevel * 3.52} 352`}
                    className="text-green-500"
                    initial={{ strokeDashoffset: 352 }}
                    animate={{ strokeDashoffset: 352 - (threatLevel * 3.52) }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-400">{100 - threatLevel}</span>
                </div>
              </div>
              <p className="text-slate-400 mt-2">Security Score</p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
              {guardrails.map((guardrail, index) => (
                <div key={guardrail.name} className="text-center p-4 rounded-lg bg-slate-800/50">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs text-slate-400">Layer {guardrail.layer}</p>
                  <p className="text-sm text-white font-medium">{guardrail.name}</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400">ACTIVE</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Alerts and Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Recent Security Alerts
            </h2>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50">
                  <span className={`mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'medium' ? 'text-yellow-400' :
                    alert.severity === 'low' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">{alert.time} • {alert.source}</span>
                      <Badge variant="secondary" className={
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        alert.severity === 'low' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
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
              <FileText className="w-5 h-5 text-cyan-400" />
              Audit Logs
            </h2>
            <div className="space-y-3">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 font-mono text-xs">
                  <span className="text-slate-500">{log.timestamp}</span>
                  <span className="text-slate-300">{log.action}</span>
                  <span className="text-slate-400">{log.user}</span>
                  <Badge className="bg-green-500/20 text-green-400">{log.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Threat Map Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Threat Intelligence Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">1,247</p>
              <p className="text-xs text-slate-400">Requests Validated Today</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-xs text-slate-400">Threats Blocked</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400">Compliance Rate</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">5/5</p>
              <p className="text-xs text-slate-400">Security Layers Active</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SecurityPage;