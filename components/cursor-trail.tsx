"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cometRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const comet = cometRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || !comet || reducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let colors = ["#c9a8ff", "#ffb067", "#ff5656"];
    const points: Point[] = Array.from({ length: 28 }, () => ({ x: -80, y: -80 }));
    let target: Point = { x: -80, y: -80 };
    let frame: number | null = null;
    let visible = false;
    let intensity = 0;
    let lastMove = 0;

    const readColors = () => {
      const styles = window.getComputedStyle(document.documentElement);
      colors = ["--lavender", "--orange", "--signal"].map(
        (property, index) => styles.getPropertyValue(property).trim() || colors[index],
      );
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target = { x: event.clientX, y: event.clientY };
      comet.style.opacity = "1";
      comet.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (!visible) {
        points.forEach((point) => Object.assign(point, target));
        visible = true;
      }
      lastMove = window.performance.now();
      intensity = 1;
      if (frame === null) frame = window.requestAnimationFrame(draw);
    };

    const hide = () => {
      visible = false;
      comet.style.opacity = "0";
    };

    const leaveViewport = (event: PointerEvent) => {
      if (!event.relatedTarget) hide();
    };

    const draw = (time: number) => {
      frame = null;
      if (time - lastMove > 900) visible = false;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      intensity = visible ? Math.min(1, intensity + 0.2) : Math.max(0, intensity - 0.04);

      let leader = target;
      points.forEach((point, index) => {
        const easing = Math.max(0.14, 0.42 - index * 0.008);
        point.x += (leader.x - point.x) * easing;
        point.y += (leader.y - point.y) * easing;
        leader = point;
      });

      if (intensity > 0.02) {
        context.save();
        context.lineCap = "round";
        context.lineJoin = "round";

        for (let index = points.length - 1; index > 0; index -= 1) {
          const progress = 1 - index / points.length;
          const color = colors[index % colors.length];
          context.beginPath();
          context.moveTo(points[index].x, points[index].y);
          context.lineTo(points[index - 1].x, points[index - 1].y);
          context.lineWidth = 3 + progress * 16;
          context.globalAlpha = (0.22 + progress * 0.7) * intensity;
          context.strokeStyle = color;
          context.shadowColor = color;
          context.shadowBlur = 18 + progress * 16;
          context.stroke();
        }

        context.globalAlpha = intensity;
        context.fillStyle = colors[0];
        context.shadowColor = colors[2];
        context.shadowBlur = 28;
        context.beginPath();
        context.arc(points[0].x, points[0].y, 9, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      if (intensity > 0.02) frame = window.requestAnimationFrame(draw);
    };

    resize();
    readColors();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leaveViewport);
    window.addEventListener("blur", hide);
    const themeWatcher = new MutationObserver(readColors);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      themeWatcher.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leaveViewport);
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="cursor-trail" />
      <div ref={cometRef} className="cursor-comet" />
    </div>
  );
}
