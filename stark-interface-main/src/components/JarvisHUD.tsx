
// ═══════════════════════════════════════════════════════════════════════════════
// J.A.R.V.I.S HOLOGRAPHIC HUD INTERFACE
// Complete React + TypeScript Implementation
// Optimized for NVIDIA 4GB VRAM — CSS/SVG-first, minimal Three.js
// ═══════════════════════════════════════════════════════════════════════════════

// ============================================================================
// FILE: src/components/hud/ArcReactorCore.tsx
// The central pulsing reactor — the heart of the interface
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';

interface ArcReactorProps {
  size?: number;
  pulseIntensity?: number; // 0-1, controlled by system load
  isActive?: boolean;
}

export const ArcReactorCore: React.FC<ArcReactorProps> = ({
  size = 280,
  pulseIntensity = 0.6,
  isActive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>(0);

  // Canvas-based particle ring — GPU-efficient vs 5000 Three.js particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const particles = 180; // Reduced from 5000 for 4GB GPU
    const radius = size * 0.38;

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      time += 0.016;

      // Outer glow ring
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.3,
        centerX, centerY, radius * 1.2
      );
      gradient.addColorStop(0, `rgba(0, 217, 255, ${0.1 * pulseIntensity})`);
      gradient.addColorStop(0.5, `rgba(0, 217, 255, ${0.05 * pulseIntensity})`);
      gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Particle ring
      for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2 + time * 0.5;
        const r = radius + Math.sin(time * 2 + i * 0.1) * 8;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        const alpha = 0.3 + Math.sin(time * 3 + i * 0.2) * 0.3;
        const particleSize = 1 + Math.sin(time * 4 + i * 0.15) * 0.5;

        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${alpha * pulseIntensity})`;
        ctx.fill();
      }

      // Inner core pulsing
      const corePulse = 0.7 + Math.sin(time * 2) * 0.3 * pulseIntensity;
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, size * 0.15
      );
      coreGradient.addColorStop(0, `rgba(255, 255, 255, ${corePulse})`);
      coreGradient.addColorStop(0.3, `rgba(0, 217, 255, ${corePulse * 0.8})`);
      coreGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Scanning line
      const scanAngle = time * 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(scanAngle) * radius * 1.1,
        centerY + Math.sin(scanAngle) * radius * 1.1
      );
      ctx.strokeStyle = `rgba(0, 217, 255, ${0.4 * pulseIntensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, pulseIntensity, isActive]);

  return (
    <div className="arc-reactor-container" style={{ width: size, height: size }}>
      {/* SVG Ring Structure */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="arc-reactor-svg"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d9ff" stopOpacity="1" />
            <stop offset="50%" stopColor="#00a8cc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0066ff" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Outer ring segments */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <circle
            key={deg}
            cx={size / 2}
            cy={size / 2}
            r={size * 0.42}
            fill="none"
            stroke="url(#cyanGradient)"
            strokeWidth="2"
            strokeDasharray={`${size * 0.08} ${size * 0.25}`}
            strokeDashoffset={-deg * (Math.PI * size * 0.42) / 360}
            filter="url(#glow)"
            opacity={0.6 + (i % 2) * 0.2}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${size / 2} ${size / 2}`}
              to={`360 ${size / 2} ${size / 2}`}
              dur={`${20 + i * 5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Inner tech ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.25}
          fill="none"
          stroke="#00d9ff"
          strokeWidth="1"
          strokeDasharray="4 8"
          opacity={0.4}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${size / 2} ${size / 2}`}
            to={`-360 ${size / 2} ${size / 2}`}
            dur="15s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Data ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const innerR = size * 0.28;
          const outerR = size * 0.32;
          return (
            <line
              key={i}
              x1={size / 2 + Math.cos(angle) * innerR}
              y1={size / 2 + Math.sin(angle) * innerR}
              x2={size / 2 + Math.cos(angle) * outerR}
              y2={size / 2 + Math.sin(angle) * outerR}
              stroke="#00d9ff"
              strokeWidth="1"
              opacity={0.3 + Math.sin(i * 0.5) * 0.2}
            />
          );
        })}
      </svg>

      {/* Canvas particle layer */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          mixBlendMode: 'screen'
        }}
      />

      {/* Center status text */}
      <div className="arc-reactor-status" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#00d9ff',
        fontFamily: "'Courier New', monospace",
        fontSize: size * 0.06,
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
      }}>
        <div style={{ fontSize: size * 0.04, opacity: 0.6 }}>SYSTEM</div>
        <div style={{ fontWeight: 'bold' }}>ONLINE</div>
      </div>
    </div>
  );
};


// ============================================================================
// FILE: src/components/hud/RadialGauge.tsx
// Circular data gauge with SVG stroke-dasharray animation
// ============================================================================

interface RadialGaugeProps {
  value: number;        // 0-100
  label: string;
  sublabel?: string;
  size?: number;
  color?: string;
  maxSegments?: number;
  animated?: boolean;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  label,
  sublabel,
  size = 120,
  color = '#00d9ff',
  maxSegments = 60,
  animated = true
}) => {
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size * 0.06;
  const segments = Math.floor((value / 100) * maxSegments);
  const gap = circumference / maxSegments;
  const dashArray = `${gap * 0.7} ${gap * 0.3}`;

  return (
    <div className="radial-gauge" style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'inline-block'
    }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 217, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Active segments */}
        {Array.from({ length: segments }).map((_, i) => {
          const segmentAngle = (360 / maxSegments) * i;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${gap * 0.7} ${circumference}`}
              strokeDashoffset={-gap * i}
              strokeLinecap="round"
              filter={`url(#glow-${label})`}
              opacity={0.4 + (i / segments) * 0.6}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={animated ? {
                animation: `gauge-pulse 2s ease-in-out ${i * 0.05}s infinite alternate`
              } : {}}
            />
          );
        })}

        {/* Inner decorative ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius * 0.65}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeDasharray="2 6"
          opacity={0.3}
        />
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color
      }}>
        <div style={{
          fontSize: size * 0.22,
          fontWeight: 'bold',
          fontFamily: "'Courier New', monospace",
          textShadow: `0 0 8px ${color}80`
        }}>
          {Math.round(value)}
        </div>
        <div style={{
          fontSize: size * 0.09,
          opacity: 0.7,
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontSize: size * 0.07,
            opacity: 0.5,
            marginTop: 2
          }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};


// ============================================================================
// FILE: src/components/hud/DataRing.tsx
// Concentric data ring with animated segments (like the image's outer rings)
// ============================================================================

interface DataRingProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  size?: number;
  ringRadius?: number;
}

export const DataRing: React.FC<DataRingProps> = ({
  data,
  size = 200,
  ringRadius = 0.45
}) => {
  const radius = size * ringRadius;
  const center = size / 2;
  const totalSegments = data.length;
  const anglePerSegment = (2 * Math.PI) / totalSegments;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="data-ring"
    >
      <defs>
        <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {data.map((item, i) => {
        const startAngle = i * anglePerSegment - Math.PI / 2;
        const endAngle = startAngle + anglePerSegment * 0.85;
        const value = item.value / 100;

        // Arc path
        const x1 = center + Math.cos(startAngle) * radius;
        const y1 = center + Math.sin(startAngle) * radius;
        const x2 = center + Math.cos(endAngle) * radius;
        const y2 = center + Math.sin(endAngle) * radius;

        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return (
          <g key={i}>
            {/* Background arc */}
            <path
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke="rgba(0, 217, 255, 0.08)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Active arc with value-based length */}
            <path
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={item.color || '#00d9ff'}
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#ring-glow)"
              opacity={0.3 + value * 0.7}
              strokeDasharray={`${(endAngle - startAngle) * radius * value} ${(endAngle - startAngle) * radius}`}
              style={{
                animation: `ring-fill 1.5s ease-out ${i * 0.1}s forwards`
              }}
            />

            {/* Label at segment midpoint */}
            <text
              x={center + Math.cos(startAngle + anglePerSegment / 2) * (radius + 25)}
              y={center + Math.sin(startAngle + anglePerSegment / 2) * (radius + 25)}
              fill={item.color || '#00d9ff'}
              fontSize="10"
              fontFamily="'Courier New', monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity={0.7}
            >
              {item.label}
            </text>

            {/* Value indicator dot */}
            <circle
              cx={center + Math.cos(startAngle + anglePerSegment * value) * radius}
              cy={center + Math.sin(startAngle + anglePerSegment * value) * radius}
              r="3"
              fill={item.color || '#00d9ff'}
              filter="url(#ring-glow)"
            >
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};


// ============================================================================
// FILE: src/components/hud/HUDPanel.tsx
// Glass-morphism panel with scanning border effect
// ============================================================================

interface HUDPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export const HUDPanel: React.FC<HUDPanelProps> = ({
  title,
  children,
  className = '',
  active = false,
  onClick
}) => {
  return (
    <div
      className={`hud-panel ${active ? 'hud-panel--active' : ''} ${className}`}
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'rgba(5, 13, 26, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Corner accents */}
      <div className="hud-corner hud-corner--tl" style={cornerStyle('top', 'left')} />
      <div className="hud-corner hud-corner--tr" style={cornerStyle('top', 'right')} />
      <div className="hud-corner hud-corner--bl" style={cornerStyle('bottom', 'left')} />
      <div className="hud-corner hud-corner--br" style={cornerStyle('bottom', 'right')} />

      {/* Scanning line */}
      <div className="hud-scan-line" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.6), transparent)',
        animation: 'scan-line 4s linear infinite',
        opacity: active ? 1 : 0.3
      }} />

      {/* Title bar */}
      <div className="hud-panel-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(0, 217, 255, 0.15)'
      }}>
        <span style={{
          color: '#00d9ff',
          fontSize: '11px',
          fontFamily: "'Courier New', monospace",
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: '0 0 5px rgba(0, 217, 255, 0.3)'
        }}>
          {title}
        </span>
        <span className="hud-status-indicator" style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: active ? '#00ff9f' : '#ff4757',
          boxShadow: active 
            ? '0 0 8px rgba(0, 255, 159, 0.6)' 
            : '0 0 8px rgba(255, 71, 87, 0.6)',
          animation: active ? 'pulse-dot 2s ease-in-out infinite' : 'none'
        }} />
      </div>

      {/* Content */}
      <div className="hud-panel-content">
        {children}
      </div>
    </div>
  );
};

const cornerStyle = (vPos: string, hPos: string): React.CSSProperties => ({
  position: 'absolute',
  [vPos]: '-1px',
  [hPos]: '-1px',
  width: '12px',
  height: '12px',
  border: '2px solid #00d9ff',
  [vPos === 'top' ? 'borderBottom' : 'borderTop']: 'none',
  [hPos === 'left' ? 'borderRight' : 'borderLeft']: 'none',
  borderRadius: vPos === 'top' ? '0 0 4px 0' : '0 4px 0 0',
  opacity: 0.6
});


// ============================================================================
// FILE: src/components/hud/TabBar.tsx
// Horizontal tab bar with active indicator animation
// ============================================================================

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="hud-tab-bar" style={{
      display: 'flex',
      gap: '4px',
      padding: '4px',
      background: 'rgba(5, 13, 26, 0.8)',
      borderRadius: '8px',
      border: '1px solid rgba(0, 217, 255, 0.15)'
    }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            className={`hud-tab ${isActive ? 'hud-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: 'relative',
              padding: '8px 16px',
              background: isActive ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: isActive ? '#00d9ff' : 'rgba(0, 217, 255, 0.5)',
              fontFamily: "'Courier New', monospace",
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textShadow: isActive ? '0 0 8px rgba(0, 217, 255, 0.4)' : 'none'
            }}
          >
            {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ff4757',
                color: '#fff',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px rgba(255, 71, 87, 0.6)'
              }}>
                {tab.badge}
              </span>
            )}

            {/* Active indicator line */}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: '20%',
                right: '20%',
                height: '2px',
                background: '#00d9ff',
                borderRadius: '1px',
                boxShadow: '0 0 6px rgba(0, 217, 255, 0.6)'
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};


// ============================================================================
// FILE: src/components/hud/SystemStatusBar.tsx
// Top status bar with real-time system metrics
// ============================================================================

interface SystemMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  network: number;
  temperature: number;
  uptime: string;
}

interface SystemStatusBarProps {
  metrics: SystemMetrics;
  modelStatus: 'local' | 'cloud' | 'hybrid' | 'offline';
  activeAgents: number;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  metrics,
  modelStatus,
  activeAgents
}) => {
  const statusColors = {
    local: '#00ff9f',
    cloud: '#ffd95a',
    hybrid: '#00d9ff',
    offline: '#ff4757'
  };

  return (
    <div className="system-status-bar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: 'rgba(5, 13, 26, 0.9)',
      borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
      fontFamily: "'Courier New', monospace",
      fontSize: '11px'
    }}>
      {/* Left: System metrics */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <MetricBadge label="CPU" value={metrics.cpu} color="#00d9ff" />
        <MetricBadge label="RAM" value={metrics.memory} color="#00ff9f" />
        <MetricBadge label="GPU" value={metrics.gpu} color="#4d9fff" />
        <MetricBadge label="NET" value={metrics.network} color="#ffd95a" />
        <span style={{ color: 'rgba(0, 217, 255, 0.5)' }}>
          TEMP: {metrics.temperature}°C
        </span>
      </div>

      {/* Center: Uptime */}
      <div style={{ color: 'rgba(0, 217, 255, 0.6)', letterSpacing: '1px' }}>
        UPTIME: {metrics.uptime}
      </div>

      {/* Right: Model status + agents */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: statusColors[modelStatus],
            boxShadow: `0 0 8px ${statusColors[modelStatus]}80`
          }} />
          <span style={{ color: statusColors[modelStatus], textTransform: 'uppercase' }}>
            {modelStatus}
          </span>
        </div>

        <div style={{ color: 'rgba(0, 217, 255, 0.6)' }}>
          AGENTS: <span style={{ color: '#00d9ff' }}>{activeAgents}</span>
        </div>
      </div>
    </div>
  );
};

const MetricBadge: React.FC<{ label: string; value: number; color: string }> = ({
  label, value, color
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    <span style={{ color: 'rgba(0, 217, 255, 0.5)' }}>{label}:</span>
    <span style={{
      color,
      fontWeight: 'bold',
      textShadow: `0 0 5px ${color}40`
    }}>
      {value.toFixed(1)}%
    </span>
    {/* Mini bar */}
    <div style={{
      width: '30px',
      height: '3px',
      background: 'rgba(0, 217, 255, 0.1)',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        background: color,
        borderRadius: '2px',
        transition: 'width 0.5s ease'
      }} />
    </div>
  </div>
);


// ============================================================================
// FILE: src/components/hud/JarvisHUD.tsx
// MAIN ASSEMBLY: Complete HUD layout matching your image
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export const JarvisHUD: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemLoad, setSystemLoad] = useState(0.6);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 34.2,
    memory: 62.1,
    gpu: 45.8,
    network: 12.4,
    temperature: 58,
    uptime: '14:32:18'
  });

  // Real-time metrics simulation (replace with actual API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 3)),
        gpu: Math.max(20, Math.min(80, prev.gpu + (Math.random() - 0.5) * 8)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 10)),
        temperature: Math.max(40, Math.min(75, prev.temperature + (Math.random() - 0.5) * 2)),
        uptime: prev.uptime
      }));
      setSystemLoad(0.4 + Math.random() * 0.4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: '◉' },
    { id: 'neural', label: 'Neural', icon: '◈' },
    { id: 'systems', label: 'Systems', icon: '◉' },
    { id: 'security', label: 'Security', icon: '◆' },
    { id: 'analytics', label: 'Analytics', icon: '◊' },
    { id: 'settings', label: 'Settings', icon: '◎' }
  ];

  const ringData = [
    { label: 'CPU', value: metrics.cpu, color: '#00d9ff' },
    { label: 'MEM', value: metrics.memory, color: '#00ff9f' },
    { label: 'GPU', value: metrics.gpu, color: '#4d9fff' },
    { label: 'NET', value: metrics.network, color: '#ffd95a' },
    { label: 'DISK', value: 45.2, color: '#ff9d5a' },
    { label: 'TEMP', value: metrics.temperature, color: '#ff4757' },
    { label: 'PWR', value: 78.5, color: '#b000ff' },
    { label: 'AI', value: 92.1, color: '#00d9ff' }
  ];

  return (
    <div className="jarvis-hud" style={{
      width: '100vw',
      height: '100vh',
      background: '#050d1a',
      color: '#00d9ff',
      fontFamily: "'Courier New', 'Consolas', monospace",
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Global CSS animations */}
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(300px); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes gauge-pulse {
          0% { opacity: 0.4; }
          100% { opacity: 0.9; }
        }
        @keyframes ring-fill {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hud-panel:hover {
          border-color: rgba(0, 217, 255, 0.4) !important;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
        }
      `}</style>

      {/* Status Bar */}
      <SystemStatusBar
        metrics={metrics}
        modelStatus="hybrid"
        activeAgents={3}
      />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 280px',
        gridTemplateRows: '1fr',
        gap: '16px',
        padding: '16px',
        overflow: 'hidden'
      }}>
        {/* LEFT COLUMN: Gauges + Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          <HUDPanel title="System Load" active>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <RadialGauge
                value={systemLoad * 100}
                label="LOAD"
                sublabel="REAL-TIME"
                size={140}
                color="#00d9ff"
              />
            </div>
          </HUDPanel>

          <HUDPanel title="Performance" active>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <RadialGauge value={metrics.cpu} label="CPU" size={90} color="#00d9ff" />
              <RadialGauge value={metrics.memory} label="RAM" size={90} color="#00ff9f" />
              <RadialGauge value={metrics.gpu} label="GPU" size={90} color="#4d9fff" />
            </div>
          </HUDPanel>

          <HUDPanel title="Network" active>
            <div style={{ padding: '10px' }}>
              <div style={{
                height: '60px',
                background: 'rgba(0, 217, 255, 0.05)',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Simulated waveform */}
                <svg width="100%" height="100%" preserveAspectRatio="none">
                  <path
                    d={`M0,30 Q25,${10 + Math.random()*40} 50,30 T100,30 T150,${20 + Math.random()*20} T200,30 T250,${15 + Math.random()*30} T300,30`}
                    fill="none"
                    stroke="#00d9ff"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                </svg>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '10px',
                color: 'rgba(0, 217, 255, 0.6)'
              }}>
                <span>IN: 12.4 MB/s</span>
                <span>OUT: 3.2 MB/s</span>
              </div>
            </div>
          </HUDPanel>
        </div>

        {/* CENTER COLUMN: Arc Reactor + Data Ring */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Tab Bar */}
          <div style={{ marginBottom: '24px' }}>
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Arc Reactor */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <ArcReactorCore size={320} pulseIntensity={systemLoad} isActive />

            {/* Surrounding data ring */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}>
              <DataRing data={ringData} size={380} ringRadius={0.48} />
            </div>
          </div>

          {/* Active Tab Content */}
          <div style={{
            width: '100%',
            maxWidth: '600px'
          }}>
            {activeTab === 'overview' && (
              <HUDPanel title="System Overview" active>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '11px'
                }}>
                  <div>
                    <div style={{ color: 'rgba(0, 217, 255, 0.5)', marginBottom: '4px' }}>MODEL</div>
                    <div style={{ color: '#00d9ff' }}>Qwen2.5-3B (Local)</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(0, 217, 255, 0.5)', marginBottom: '4px' }}>BACKUP</div>
                    <div style={{ color: '#ffd95a' }}>Claude Sonnet (Cloud)</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(0, 217, 255, 0.5)', marginBottom: '4px' }}>MEMORY</div>
                    <div style={{ color: '#00ff9f' }}>1,247 entries</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(0, 217, 255, 0.5)', marginBottom: '4px' }}>SKILLS</div>
                    <div style={{ color: '#00d9ff' }}>23 active</div>
                  </div>
                </div>
              </HUDPanel>
            )}

            {activeTab === 'neural' && (
              <HUDPanel title="Neural Command" active>
                <div style={{ padding: '10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid #00d9ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>◉</div>
                    <div>
                      <div style={{ color: '#00d9ff', fontSize: '12px' }}>Neural Link Active</div>
                      <div style={{ color: 'rgba(0, 217, 255, 0.5)', fontSize: '10px' }}>
                        Latency: 45ms | Confidence: 94.2%
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter command..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#00d9ff',
                      fontFamily: "'Courier New', monospace",
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </HUDPanel>
            )}

            {activeTab === 'systems' && (
              <HUDPanel title="Active Systems" active>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Hermes Agent', 'Rufolo Swarm', 'Flow Guardian', 'Digital Twin', 'Causal Memory'].map((sys, i) => (
                    <div key={sys} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(0, 217, 255, 0.03)',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: '#00d9ff' }}>{sys}</span>
                      <span style={{
                        color: '#00ff9f',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#00ff9f',
                          boxShadow: '0 0 4px rgba(0, 255, 159, 0.6)'
                        }} />
                        ONLINE
                      </span>
                    </div>
                  ))}
                </div>
              </HUDPanel>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Modules + Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          <HUDPanel title="Module Status" active>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { name: 'Memory Vault', status: 'synced', pct: 100 },
                { name: 'Flow Guardian', status: 'armed', pct: 100 },
                { name: 'Predictive Cache', status: 'warm', pct: 87 },
                { name: 'Biometric', status: 'active', pct: 100 },
                { name: 'Security', status: 'locked', pct: 100 },
                { name: 'Automation', status: 'idle', pct: 34 },
              ].map(mod => (
                <div key={mod.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  fontSize: '10px'
                }}>
                  <span style={{ color: 'rgba(0, 217, 255, 0.7)' }}>{mod.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '3px',
                      background: 'rgba(0, 217, 255, 0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${mod.pct}%`,
                        height: '100%',
                        background: mod.pct === 100 ? '#00ff9f' : '#ffd95a',
                        borderRadius: '2px'
                      }} />
                    </div>
                    <span style={{
                      color: mod.pct === 100 ? '#00ff9f' : '#ffd95a',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      width: '50px',
                      textAlign: 'right'
                    }}>
                      {mod.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </HUDPanel>

          <HUDPanel title="Agent Activity" active>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '10px'
            }}>
              <div style={{
                padding: '8px',
                background: 'rgba(0, 217, 255, 0.03)',
                borderRadius: '4px',
                borderLeft: '2px solid #00d9ff'
              }}>
                <div style={{ color: '#00d9ff', marginBottom: '2px' }}>Hermes</div>
                <div style={{ color: 'rgba(0, 217, 255, 0.5)' }}>Processing task queue... 3 pending</div>
              </div>
              <div style={{
                padding: '8px',
                background: 'rgba(0, 255, 159, 0.03)',
                borderRadius: '4px',
                borderLeft: '2px solid #00ff9f'
              }}>
                <div style={{ color: '#00ff9f', marginBottom: '2px' }}>Rufolo</div>
                <div style={{ color: 'rgba(0, 217, 255, 0.5)' }}>Swarm coordination active | 2 agents</div>
              </div>
            </div>
          </HUDPanel>

          <HUDPanel title="Weather / Time" active>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#00d9ff',
                textShadow: '0 0 15px rgba(0, 217, 255, 0.4)'
              }}>
                14:32
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(0, 217, 255, 0.6)',
                marginTop: '4px'
              }}>
                Saturday, June 13, 2026
              </div>
              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: 'rgba(0, 217, 255, 0.03)',
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(0, 217, 255, 0.5)' }}>WEATHER</div>
                <div style={{ fontSize: '14px', color: '#00d9ff', marginTop: '2px' }}>☁ 24°C</div>
                <div style={{ fontSize: '10px', color: 'rgba(0, 217, 255, 0.5)' }}>Partly Cloudy</div>
              </div>
            </div>
          </HUDPanel>
        </div>
      </div>
    </div>
  );
};

export default JarvisHUD;
