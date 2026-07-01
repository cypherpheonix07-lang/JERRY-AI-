import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))",
        arc: {
          DEFAULT: "#00D4FF",
          light: "#33DFFF",
          dark: "#00A8CC",
          glow: "rgba(0,212,255,0.6)",
        },
        gold: {
          DEFAULT: "#FFD60A",
          light: "#FFE44D",
          dark: "#CCA800",
        },
        surface: {
          DEFAULT: "rgba(0,8,20,0.75)",
          light: "rgba(0,12,30,0.85)",
          dark: "rgba(0,4,10,0.9)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scan-border": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-arc": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9", filter: "drop-shadow(0 0 12px rgba(0,212,255,0.7))" },
          "50%": { transform: "scale(1.06)", opacity: "1", filter: "drop-shadow(0 0 24px rgba(0,212,255,1))" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "spin-rev": {
          to: { transform: "rotate(-360deg)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 1px)" },
          "40%": { transform: "translate(2px, -1px)" },
          "60%": { transform: "translate(-1px, -2px)" },
          "80%": { transform: "translate(1px, 2px)" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "0.85" },
          "50%": { opacity: "0.4" },
          "55%": { opacity: "0.95" },
        },
        "typewriter": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slot-machine": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { transform: "translateY(5%)", opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "chromatic-aberration": {
          "0%, 100%": { filter: "none" },
          "50%": { filter: "url(#chromatic)" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ring-rotate": {
          "0%": { transform: "rotateX(60deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(60deg) rotateZ(360deg)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scan-border": "scan-border 4s linear infinite",
        "pulse-arc": "pulse-arc 2.4s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
        "spin-rev": "spin-rev 18s linear infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
        "glitch": "glitch 3s infinite",
        "flicker": "flicker 4s infinite",
        "typewriter": "typewriter 1s steps(40) forwards",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slot-machine": "slot-machine 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "chromatic-aberration": "chromatic-aberration 0.3s ease-in-out",
        "ticker-scroll": "ticker-scroll 30s linear infinite",
        "ring-rotate": "ring-rotate 8s linear infinite",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
