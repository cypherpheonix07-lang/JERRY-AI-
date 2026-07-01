import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJarvisStore } from '@/store/jarvisStore';
import { 
  LayoutDashboard, 
  Cpu, 
  Network, 
  Shield, 
  Radar, 
  Terminal,
  Menu,
  ChevronLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  status?: 'online' | 'warning' | 'offline';
}

const CommandChannels: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed } = useJarvisStore(state => ({
    sidebarCollapsed: state.ui.sidebarCollapsed,
  }));
  const { toggleSidebar, setWsConnected } = useJarvisStore();

  const navItems: NavItem[] = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      status: 'online'
    },
    { 
      path: '/systems', 
      label: 'Systems', 
      icon: <Cpu className="w-5 h-5" />,
      status: 'online'
    },
    { 
      path: '/network', 
      label: 'Network', 
      icon: <Network className="w-5 h-5" />,
      badge: 3,
      status: 'warning'
    },
    { 
      path: '/security', 
      label: 'Security', 
      icon: <Shield className="w-5 h-5" />,
      status: 'online'
    },
    { 
      path: '/sensors', 
      label: 'Sensors', 
      icon: <Radar className="w-5 h-5" />,
      status: 'online'
    },
    { 
      path: '/ops', 
      label: 'Ops Center', 
      icon: <Terminal className="w-5 h-5" />,
      status: 'online'
    },
  ];

  const isActive = (path: string) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online': return <CheckCircle2 className="w-3 h-3" />;
      case 'warning': return <AlertCircle className="w-3 h-3" />;
      case 'offline': return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: sidebarCollapsed ? 64 : 240,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      className="fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-40 overflow-hidden"
    >
      {/* Diagonal accent line - JARVIS signature */}
      <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-cyan-400/80 to-transparent transform rotate-45 origin-top-right translate-x-8" />
      <div className="absolute top-0 right-0 w-1 h-32 bg-gradient-to-b from-cyan-400/80 to-transparent transform -rotate-45 origin-top-right -translate-y-8" />
      
      {/* Header with logo and toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <span className="font-orbitron font-bold text-cyan-400 text-lg">J.A.R.V.I.S</span>
          </motion.div>
        )}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-[0.65rem] font-bold tracking-[0.15em] text-slate-500 uppercase">COMMAND CHANNELS</span>
            <div className="flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[0.6rem] font-semibold text-red-400">LIVE</span>
            </div>
          </motion.div>
        )}
        {sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </motion.div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-400"
        >
          {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-2 mt-4">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
              isActive(item.path)
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-cyan-300'
            }`}
          >
            {/* Active indicator line */}
            {isActive(item.path) && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full"
                initial={false}
              />
            )}
            
            <span className={isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}>
              {item.icon}
            </span>
            
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 font-medium text-sm"
              >
                {item.label}
              </motion.span>
            )}

            {/* Badge for notifications */}
            {!sidebarCollapsed && item.badge && (
              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                {item.badge}
              </span>
            )}

            {/* Status indicator */}
            {!sidebarCollapsed && item.status && (
              <span className={getStatusColor(item.status)}>
                {getStatusIcon(item.status)}
              </span>
            )}

            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 rounded-lg text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
                {item.badge && ` (${item.badge})`}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer with system status */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        {!sidebarCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">OMEGA v2.0.1</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default CommandChannels;