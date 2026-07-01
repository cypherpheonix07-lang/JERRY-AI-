/**
 * R3F Canvas wrapper for 3D scene
 */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Avatar3D } from './Avatar3D';

interface AvatarCanvasProps {
  modelUrl?: string;
  className?: string;
}

const AvatarCanvasContent: React.FC<{ modelUrl?: string }> = ({ modelUrl }) => {
  return (
    <Suspense fallback={null}>
      <Avatar3D modelUrl={modelUrl} />
    </Suspense>
  );
};

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  modelUrl,
  className = 'w-full h-full',
}) => {
  return (
    <Canvas
      camera={{
        position: [0, 0.5, 3],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        alpha: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      }}
      className={className}
      dpr={[1, 2]}
    >
      <AvatarCanvasContent modelUrl={modelUrl} />
    </Canvas>
  );
};
