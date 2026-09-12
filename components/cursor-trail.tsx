"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || !finePointer.matches || reducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const colors = ["#c9a8ff", "#ffb067", "#ff5656"];
    const points: Point[] = Array.from({ length: 18 }, () => ({ x: -40, y: -40 }));
    let target: Point = { x: -40, y: -40 };
    let frame = 0;
    let active = false;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const move = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      if (!active) {
        points.forEach((point) => Object.assign(point, target));
        active = true;
      }
    };

    const leave = () => { active = false; };
    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let leader = target;

      points.forEach((point, index) => {
        const easing = Math.max(.1, .32 - index * .009);
        point.x += (leader.x - point.x) * easing;
        point.y += (leader.y - point.y) * easing;
        leader = point;

        if (!active) return;
        const progress = 1 - index / points.length;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(.7, 3.8 * progress), 0, Math.PI * 2);
        context.fillStyle = `${colors[index % colors.length]}${Math.round(progress * 115).toString(16).padStart(2, "0")}`;
        context.fill();
      });

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />;
}
