"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pointer = pointerRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || !pointer) return;

    const stopIfReduced = () => {
      if (!motion.matches) return false;
      canvas.width = 0;
      canvas.height = 0;
      pointer.style.opacity = "0";
      return true;
    };

    if (stopIfReduced()) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const points: Point[] = Array.from({ length: 10 }, () => ({ x: -120, y: -120 }));
    let target: Point = { x: -120, y: -120 };
    let frame = 0;
    let running = false;
    let lastMove = 0;
    let color = "#c9a8ff";

    const readColor = () => {
      const styles = getComputedStyle(document.documentElement);
      color = styles.getPropertyValue("--lavender").trim() || "#c9a8ff";
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (time: number) => {
      if (motion.matches) {
        running = false;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        pointer.style.opacity = "0";
        return;
      }

      const fading = time - lastMove > 90;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let leader = target;
      points.forEach((point, index) => {
        const easing = fading ? 0.2 : Math.max(0.28, 0.62 - index * 0.03);
        point.x += (leader.x - point.x) * easing;
        point.y += (leader.y - point.y) * easing;
        leader = point;
      });

      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = color;
      context.shadowColor = "transparent";

      for (let index = points.length - 1; index > 0; index -= 1) {
        const progress = 1 - index / points.length;
        context.beginPath();
        context.moveTo(points[index].x, points[index].y);
        context.lineTo(points[index - 1].x, points[index - 1].y);
        context.lineWidth = 0.8 + progress * 1.6;
        context.globalAlpha = (0.08 + progress * 0.16) * (fading ? 0.45 : 1);
        context.stroke();
      }

      pointer.style.opacity = fading ? "0.18" : "0.42";
      pointer.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;

      const stillMoving = Math.hypot(points[0].x - target.x, points[0].y - target.y) > 0.4 || time - lastMove < 500;
      if (stillMoving) frame = window.requestAnimationFrame(draw);
      else running = false;
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || motion.matches) return;
      target = { x: event.clientX, y: event.clientY };
      lastMove = window.performance.now();
      if (!running) {
        running = true;
        points.forEach((point) => Object.assign(point, target));
        frame = window.requestAnimationFrame(draw);
      }
    };

    const onMotionChange = () => {
      if (stopIfReduced()) {
        running = false;
        window.cancelAnimationFrame(frame);
      }
    };

    resize();
    readColor();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    motion.addEventListener("change", onMotionChange);
    const themeWatcher = new MutationObserver(readColor);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      themeWatcher.disconnect();
      motion.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="cursor-trail" />
      <svg ref={pointerRef} className="cursor-glyph" viewBox="0 0 12 20" width="12" height="20">
        <path d="M1.2 1.2 1.2 14.8 4.1 11.9 6.7 18.2 8.6 17.4 6 11.1 10.6 11.1Z" />
      </svg>
    </div>
  );
}
