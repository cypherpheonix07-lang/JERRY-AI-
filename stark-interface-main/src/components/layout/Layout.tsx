import React from 'react';
import { Outlet } from 'react-router-dom';
import CommandChannels from './CommandChannels';
import { motion, AnimatePresence } from 'framer-motion';
import { useJarvisStore } from '@/store/jarvisStore';
import { Wifi, WifiOff } from 'lucide-react';

const Layout: React.FC = () => {
  const { wsConnected, sidebarCollapsed } = useJarvisStore(state => ({
    wsConnected: state.connection.wsConnected,
    sidebarCollapsed: state.ui.sidebarCollapsed,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-100 flex overflow-hidden">
      {/* Persistent Sidebar */}
      <CommandChannels />
      
      {/* Main Content Area */}
      <main 
        className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}
      >
        {/* Global Connection Status Bar */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-700">
          {wsConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-mono">ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-mono">OFFLINE</span>
            </>
          )}
        </div>

        {/* Animated Page Outlet */}
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;