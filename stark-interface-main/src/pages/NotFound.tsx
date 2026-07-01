import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[80vh]"
    >
      <div className="text-center">
        <AlertTriangle className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Command Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The JARVIS system cannot locate the requested page. The command channel you're trying to access does not exist.
        </p>
        <Link to="/dashboard">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold">
            Return to Mission Control
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;