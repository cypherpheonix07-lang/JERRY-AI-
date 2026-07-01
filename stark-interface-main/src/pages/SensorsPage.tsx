import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Camera, Mic, Wind, Thermometer, Droplets, Activity, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useJarvisStore } from '@/store/jarvisStore';

// Selector pattern for Sensors page
const useSensorsState = () => {
  const sensors = useJarvisStore(state => state.sensors);
  const setCameraActive = useJarvisStore(state => state.setCameraActive);
  const setMicrophoneActive = useJarvisStore(state => state.setMicrophoneActive);
  const setEnvironmentalActive = useJarvisStore(state => state.setEnvironmentalActive);
  
  return { sensors, setCameraActive, setMicrophoneActive, setEnvironmentalActive };
};

const SensorsPage: React.FC = () => {
  const { sensors, setCameraActive, setMicrophoneActive, setEnvironmentalActive } = useSensorsState();

  const environmentalData = {
    temperature: 22.5,
    humidity: 45,
    airQuality: 92,
    ambientLight: 680,
  };

  const biometricReadings = [
    { name: 'Heart Rate', value: 72, unit: 'BPM', status: 'normal' },
    { name: 'Blood Oxygen', value: 98, unit: '%', status: 'normal' },
    { name: 'Stress Level', value: 34, unit: '%', status: 'low' },
    { name: 'Focus Score', value: 87, unit: '%', status: 'excellent' },
  ];

  const activeSensors = [
    { name: 'WebCam HD', type: 'camera', status: sensors.cameraActive ? 'active' : 'inactive', resolution: '1920x1080' },
    { name: 'Array Microphone', type: 'audio', status: sensors.microphoneActive ? 'active' : 'inactive', channels: '7.1' },
    { name: 'Climate Sensor', type: 'environmental', status: sensors.environmentalActive ? 'active' : 'inactive', range: '-40°C to 85°C' },
    { name: 'Biometric Scanner', type: 'biometric', status: 'active', fps: '30' },
    { name: 'Ambient Light', type: 'environmental', status: sensors.environmentalActive ? 'active' : 'inactive', range: '0-10000 lux' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Sensor Network</h1>
        <p className="text-slate-400">Camera feeds, biometric monitoring, and environmental sensor data</p>
      </motion.div>

      {/* Camera Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Primary Camera Feed
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{sensors.cameraActive ? 'Recording' : 'Standby'}</span>
              <Button
                variant="secondary"
                onClick={() => setCameraActive(!sensors.cameraActive)}
                className="flex items-center gap-2"
              >
                {sensors.cameraActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {sensors.cameraActive ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
          <div className="aspect-video bg-slate-950 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700">
            {sensors.cameraActive ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-green-400 animate-pulse" />
                </div>
                <p className="text-green-400 font-mono">CAMERA ACTIVE • 1920x1080 @ 30fps</p>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">Camera feed disabled for privacy</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Environmental and Biometrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-400" />
              Environmental Data
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <Thermometer className="w-6 h-6 text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">{environmentalData.temperature}°C</p>
                <p className="text-xs text-slate-400">Temperature</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <Droplets className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">{environmentalData.humidity}%</p>
                <p className="text-xs text-slate-400">Humidity</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <Wind className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">{environmentalData.airQuality} AQI</p>
                <p className="text-xs text-slate-400">Air Quality</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <Activity className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-white">{environmentalData.ambientLight}</p>
                <p className="text-xs text-slate-400">Ambient Light (lux)</p>
              </div>
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
              <Activity className="w-5 h-5 text-green-400" />
              Biometric Readings
            </h2>
            <div className="space-y-4">
              {biometricReadings.map((reading) => (
                <div key={reading.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{reading.name}</span>
                    <span className="text-cyan-400 font-mono">{reading.value}{reading.unit}</span>
                  </div>
                  <Progress value={reading.value} className="h-2 bg-slate-800" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* All Sensors Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400" />
            Sensor Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeSensors.map((sensor) => (
              <div key={sensor.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${sensor.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-white font-medium text-sm">{sensor.name}</span>
                </div>
                <p className="text-xs text-slate-500">{sensor.type}</p>
                <p className="text-xs text-slate-400 mt-1">{sensor.resolution || sensor.channels || sensor.range}</p>
                <Badge className={`mt-2 ${sensor.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {sensor.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SensorsPage;