/**
 * 3D Avatar component with lip-sync and emotional states
 * Uses React Three Fiber with morph targets for facial animations
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useConversationStore, useAudioStore } from '@/store';
import type { AvatarState, MorphTargetConfig } from '@/types';

interface Avatar3DProps {
  modelUrl?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enableShadow?: boolean;
}

/**
 * Morph target weights interpolation using lerp
 */
function lerpMorphTarget(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

/**
 * Avatar idle animation state machine
 */
class AvatarAnimationController {
  private morphWeights: MorphTargetConfig = {
    jawOpen: 0,
    mouthSmile: 0,
    mouthSad: 0,
    browRaise: 0,
    browFurrow: 0,
    eyeWide: 0,
    eyeSquint: 0,
    cheekPuff: 0,
  };

  private targetWeights: MorphTargetConfig = { ...this.morphWeights };
  private breathingPhase = 0;
  private blinkPhase = 0;
  private blinkDuration = 0.15; // seconds
  private blinkInterval = 4; // seconds between blinks
  private nextBlinkTime = Math.random() * this.blinkInterval;

  /**
   * Update animation state based on audio amplitude
   */
  updateAudioDriven(amplitude: number): void {
    // Map amplitude to morph targets for lip-sync
    const jawOpenTarget = Math.max(0, Math.min(1, amplitude * 1.5));
    const cheekPuffTarget = amplitude * 0.3;

    this.targetWeights.jawOpen = jawOpenTarget;
    this.targetWeights.cheekPuff = cheekPuffTarget;
  }

  /**
   * Update idle breathing animation
   */
  updateIdleBreathing(deltaTime: number): void {
    this.breathingPhase += deltaTime;
    const breathing = Math.sin(this.breathingPhase * 0.5) * 0.1;
    this.targetWeights.jawOpen = Math.max(0, breathing);
    this.targetWeights.cheekPuff = Math.max(0, breathing * 0.5);
  }

  /**
   * Update blinking animation
   */
  updateBlinking(deltaTime: number): void {
    this.nextBlinkTime -= deltaTime;

    if (this.nextBlinkTime <= 0) {
      this.blinkPhase = 0;
      this.nextBlinkTime = this.blinkInterval + (Math.random() - 0.5) * 2;
    }

    if (this.blinkPhase < this.blinkDuration) {
      this.blinkPhase += deltaTime;
      const blinkProgress = this.blinkPhase / this.blinkDuration;
      const blinkAmount = Math.sin(blinkProgress * Math.PI);
      this.targetWeights.eyeSquint = blinkAmount * 0.5;
    } else {
      this.targetWeights.eyeSquint = 0;
    }
  }

  /**
   * Interpolate toward target weights
   */
  interpolate(alpha: number): void {
    Object.keys(this.morphWeights).forEach(key => {
      const k = key as keyof MorphTargetConfig;
      this.morphWeights[k] = lerpMorphTarget(
        this.morphWeights[k],
        this.targetWeights[k],
        alpha
      );
    });
  }

  /**
   * Get current morph target weights
   */
  getWeights(): MorphTargetConfig {
    return { ...this.morphWeights };
  }

  /**
   * Reset to idle state
   */
  reset(): void {
    this.morphWeights = {
      jawOpen: 0,
      mouthSmile: 0,
      mouthSad: 0,
      browRaise: 0,
      browFurrow: 0,
      eyeWide: 0,
      eyeSquint: 0,
      cheekPuff: 0,
    };
    this.targetWeights = { ...this.morphWeights };
  }
}

/**
 * Create a procedural avatar using Three.js primitives
 */
function createProceduralAvatar(): THREE.Group {
  const group = new THREE.Group();

  // Head
  const headGeometry = new THREE.IcosahedronGeometry(0.3, 4);
  const material = new THREE.MeshPhongMaterial({
    color: 0xfdbcb4,
    shininess: 100,
    flatShading: false,
  });
  const head = new THREE.Mesh(headGeometry, material);
  head.position.y = 0.2;
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.1, 0.35, 0.25);
  leftEye.castShadow = true;
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.1, 0.35, 0.25);
  rightEye.castShadow = true;
  group.add(rightEye);

  // Mouth
  const mouthGeometry = new THREE.TorusGeometry(0.1, 0.03, 16, 8, Math.PI);
  const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b9d });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0, 0.1, 0.25);
  mouth.rotation.z = Math.PI;
  mouth.castShadow = true;
  group.add(mouth);

  // Neck
  const neckGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.3, 16);
  const neckMaterial = new THREE.MeshPhongMaterial({ color: 0xfdbcb4 });
  const neck = new THREE.Mesh(neckGeometry, neckMaterial);
  neck.position.y = -0.1;
  neck.castShadow = true;
  neck.receiveShadow = true;
  group.add(neck);

  // Torso
  const torsoGeometry = new THREE.ConeGeometry(0.25, 0.6, 16);
  const torsoMaterial = new THREE.MeshPhongMaterial({ color: 0x4f46e5 });
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
  torso.position.y = -0.5;
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  return group;
}

/**
 * Avatar mesh component
 */
const AvatarMesh: React.FC<{ modelUrl?: string }> = ({ modelUrl }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const animationControllerRef = useRef(new AvatarAnimationController());

  const { scene, camera } = useThree();
  const avatarState = useConversationStore(state => state.avatarState);
  const audioLevels = useAudioStore(state => state.audioLevels);

  // Try to load GLTF model, fallback to procedural
  let modelScene: THREE.Scene | null = null;
  try {
    // useGLTF might fail for non-existent files, so we catch and use procedural
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useGLTF(modelUrl || '/models/avatar.glb', true);
    modelScene = result.scene;
  } catch (e) {
    // Silently fail and use procedural avatar
    modelScene = null;
  }

  useEffect(() => {
    if (!groupRef.current) return;

    // Create avatar (loaded or procedural)
    let avatar: THREE.Group;
    if (modelScene) {
      avatar = modelScene.clone() as THREE.Group;
      // Find the skinned mesh
      avatar.traverse((child) => {
        if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
          meshRef.current = child.parent as THREE.Group || groupRef.current;
        }
      });
    } else {
      // Use procedural avatar
      avatar = createProceduralAvatar();
      meshRef.current = avatar;
    }

    groupRef.current.add(avatar);

    return () => {
      groupRef.current?.clear();
    };
  }, [modelScene]);

  /**
   * Main animation loop
   */
  useFrame((state, delta) => {
    const controller = animationControllerRef.current;

    // Update animation state based on avatar state
    switch (avatarState) {
      case 'speaking':
        if (audioLevels) {
          controller.updateAudioDriven(audioLevels.amplitude);
        }
        controller.updateBlinking(delta);
        break;

      case 'listening':
        controller.updateIdleBreathing(delta);
        controller.updateBlinking(delta);
        break;

      case 'thinking':
        controller.updateIdleBreathing(delta);
        controller.updateBlinking(delta);
        // Add subtle eye movement for thinking
        controller.targetWeights.browRaise = Math.sin(state.clock.getElapsedTime()) * 0.2;
        break;

      case 'idle':
      default:
        controller.updateIdleBreathing(delta);
        controller.updateBlinking(delta);
        break;
    }

    // Interpolate toward target weights
    controller.interpolate(0.1); // Smooth interpolation factor

    // Apply morph target weights to mesh if it has morphTargetInfluences
    if (meshRef.current instanceof THREE.SkinnedMesh && meshRef.current.morphTargetInfluences) {
      const weights = controller.getWeights();
      const morphTargetNames = Object.keys(weights);

      morphTargetNames.forEach((name, index) => {
        const targetName = name as keyof MorphTargetConfig;
        const value = weights[targetName];

        if (meshRef.current && meshRef.current.morphTargetInfluences) {
          meshRef.current.morphTargetInfluences[index] = Math.max(0, Math.min(1, value));
        }
      });
    }

    // Subtle head movement during speaking
    if (avatarState === 'speaking' && groupRef.current) {
      const headBob = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      groupRef.current.rotation.z = headBob;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.02;
    } else if (groupRef.current) {
      // Return to neutral
      groupRef.current.rotation.z = groupRef.current.rotation.z * 0.9;
      groupRef.current.position.y = groupRef.current.position.y * 0.9;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Mesh will be added dynamically */}
    </group>
  );
};

/**
 * Particle aura effect that intensifies during speaking/thinking
 */
const ParticleAura: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const avatarState = useConversationStore(state => state.avatarState);

  const particleCount = 100;
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    // Update particle intensity based on avatar state
    let intensity = 0;
    switch (avatarState) {
      case 'speaking':
        intensity = 0.8;
        break;
      case 'thinking':
        intensity = 0.5;
        break;
      default:
        intensity = 0.1;
    }

    // Rotate particles
    particlesRef.current.rotation.x += 0.0001 * intensity;
    particlesRef.current.rotation.y += 0.0002 * intensity;

    // Update material opacity
    if (particlesRef.current.material instanceof THREE.PointsMaterial) {
      particlesRef.current.material.opacity = intensity;
    }
  });

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      opacity: 0.1,
      transparent: true,
      color: 0x4f46e5,
    });
  }, []);

  return (
    <group ref={groupRef}>
      <points ref={particlesRef} geometry={particles} material={material} />
    </group>
  );
};

/**
 * Main Avatar 3D component
 */
export const Avatar3D: React.FC<Avatar3DProps> = ({
  modelUrl,
  scale = 1.5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  enableShadow = true,
}) => {
  return (
    <>
      <Float
        speed={2}
        rotationIntensity={0.1}
        floatIntensity={0.2}
        position={position}
        rotation={rotation}
      >
        <group scale={scale}>
          <AvatarMesh modelUrl={modelUrl} />
          <ParticleAura />
        </group>
      </Float>

      {enableShadow && (
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.8}
          scale={10}
          blur={2.5}
        />
      )}

      <Environment preset="sunset" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
    </>
  );
};
