// MediaPipe Hands gesture detector with floating webcam HUD.
import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import { jarvisBus, type Cmd } from "@/lib/jarvisBus";

type Landmark = { x: number; y: number; z: number };

// Returns gesture name from 21 hand landmarks.
function detectGesture(lm: Landmark[]): string | null {
  if (!lm || lm.length < 21) return null;
  // For a hand with palm facing camera, a finger is "up" if tip.y < pip.y (image y grows downward).
  // Index: 8 vs 6, Middle: 12 vs 10, Ring: 16 vs 14, Pinky: 20 vs 18.
  const fingerUp = (tip: number, pip: number) => lm[tip].y < lm[pip].y - 0.02;
  const index = fingerUp(8, 6);
  const middle = fingerUp(12, 10);
  const ring = fingerUp(16, 14);
  const pinky = fingerUp(20, 18);
  // Thumb: compare x for left/right (rough). Use distance from wrist instead.
  const wrist = lm[0];
  const thumbTip = lm[4], thumbIp = lm[3];
  const thumbExt = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y) >
                   Math.hypot(thumbIp.x  - wrist.x, thumbIp.y  - wrist.y) + 0.02;
  // Thumb up: tip clearly above wrist & most fingers folded
  const thumbsUp = thumbTip.y < wrist.y - 0.1 && !index && !middle && !ring && !pinky;
  // Fist: nothing extended
  const fist = !index && !middle && !ring && !pinky && !thumbExt;
  // Open palm: 4 fingers extended (thumb optional)
  const openPalm = index && middle && ring && pinky;
  // Peace: index + middle, others not
  const peace = index && middle && !ring && !pinky;
  // Call me: thumb + pinky extended only
  const callMe = thumbExt && pinky && !index && !middle && !ring;
  // Pointing index up
  const pointUp = index && !middle && !ring && !pinky && lm[8].y < lm[5].y;
  // Pointing index down (tip below knuckle)
  const pointDown = index && !middle && !ring && !pinky && lm[8].y > lm[5].y + 0.1;

  if (thumbsUp) return "THUMBS_UP";
  if (openPalm) return "OPEN_PALM";
  if (peace) return "PEACE";
  if (callMe) return "CALL_ME";
  if (fist) return "FIST";
  if (pointUp) return "POINT_UP";
  if (pointDown) return "POINT_DOWN";
  return null;
}

const GESTURE_LABEL: Record<string, string> = {
  THUMBS_UP: "👍 CONFIRM",
  OPEN_PALM: "✋ CANCEL",
  PEACE: "✌️ MENU",
  CALL_ME: "🤙 VOICE",
  FIST: "👊 LOCK",
  POINT_UP: "☝️ SCROLL UP",
  POINT_DOWN: "👇 SCROLL DOWN",
};

const GESTURE_CMD: Record<string, Cmd> = {
  THUMBS_UP: "confirm",
  OPEN_PALM: "cancel",
  PEACE: "toggle-menu",
  CALL_ME: "voice",
  FIST: "lock",
  POINT_UP: "scroll-up",
  POINT_DOWN: "scroll-down",
};

interface Props { enabled: boolean; onClose: () => void; }

export const GestureHud = ({ enabled, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastEmitRef = useRef<{ g: string; t: number }>({ g: "", t: 0 });

  useEffect(() => {
    if (!enabled) return;
    let detector: HandLandmarker | null = null;
    let raf = 0;
    let stream: MediaStream | null = null;
    let alive = true;

    (async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );
        detector = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        const v = videoRef.current!; v.srcObject = stream; await v.play();

        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;

        const tick = () => {
          if (!alive || !detector || v.readyState < 2) { raf = requestAnimationFrame(tick); return; }
          const t = performance.now();
          const result = detector.detectForVideo(v, t);
          ctx.clearRect(0, 0, c.width, c.height);
          if (result.landmarks?.[0]) {
            const lm = result.landmarks[0];
            // draw landmarks (mirrored)
            ctx.fillStyle = "hsl(190 100% 60%)";
            ctx.shadowColor = "hsl(190 100% 60%)";
            ctx.shadowBlur = 6;
            for (const p of lm) {
              ctx.beginPath();
              ctx.arc((1 - p.x) * c.width, p.y * c.height, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowBlur = 0;
            const g = detectGesture(lm);
            setGesture(g);
            if (g) {
              const now = Date.now();
              if (g !== lastEmitRef.current.g || now - lastEmitRef.current.t > 1500) {
                lastEmitRef.current = { g, t: now };
                jarvisBus.emit(GESTURE_CMD[g]);
              }
            }
          } else {
            setGesture(null);
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (e: any) {
        console.error(e); setError(e.message || "Camera unavailable");
      }
    })();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach(t => t.stop());
      detector?.close();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-30 hud-panel p-2 w-[260px]"
    >
      <div className="flex items-center gap-2 mb-1 px-1">
        <Camera className="w-3 h-3 text-primary" />
        <span className="text-[10px] tracking-widest text-primary glow-text">GESTURE FEED</span>
        <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
      </div>
      <div className="relative w-full aspect-[4/3] bg-black rounded overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" muted playsInline />
        <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 w-full h-full" />
        {error && <div className="absolute inset-0 flex items-center justify-center text-destructive text-[10px] p-2 text-center">{error}</div>}
      </div>
      <AnimatePresence mode="wait">
        {gesture && (
          <motion.div
            key={gesture}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mt-2 text-center text-xs font-bold tracking-widest text-primary glow-text border border-primary/50 rounded py-1 bg-primary/10"
          >
            {GESTURE_LABEL[gesture]}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
