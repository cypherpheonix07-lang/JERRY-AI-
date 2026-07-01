import { motion } from 'framer-motion';
import { useSecurityState } from '../store/jarvisStore';

const SecurityPage = () => {
  const { security } = useSecurityState();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Security Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(security.guardrailStatus || []).map((status, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{status.name}</h3>
            <p className="text-slate-400">{status.description}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
              status.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {status.status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SecurityPage;