"use client";

import { useEffect, useRef } from "react";

// Candlelight dust drifting upward, with rare warm "seal" embers.
// Particles gently part when the cursor passes near them.
const PAPER = [244, 241, 232];
const SEAL = [232, 185, 88];
const CURSOR_RADIUS = 110;
const EMBER_RATIO = 0.12; // share of particles that glow seal-gold

function buildParticles(width, height, count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const isEmber = Math.random() < EMBER_RATIO;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      baseRadius: isEmber ? 1.6 + Math.random() * 1.2 : 0.6 + Math.random() * 1.1,
      drift: 6 + Math.random() * 14,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.3 + Math.random() * 0.5,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.4 + Math.random() * 0.6,
      color: isEmber ? SEAL : PAPER,
      baseOpacity: isEmber ? 0.55 : 0.3 + Math.random() * 0.35,
    });
  }
  return particles;
}

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let pointer = { x: -9999, y: -9999, active: false };
    let rafId = null;
    let lastTime = performance.now();

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.round(Math.min(width, 1600) * 0.13);
      particles = buildParticles(width, height, Math.max(50, targetCount));
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.baseOpacity})`;
        ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.sway += p.swaySpeed * dt;
        p.y -= p.drift * dt;
        p.x += Math.sin(p.sway) * 4 * dt;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        let renderX = p.x;
        let renderY = p.y;
        let glow = 0;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS && dist > 0.01) {
            const force = (1 - dist / CURSOR_RADIUS) * 18;
            renderX = p.x + (dx / dist) * force;
            renderY = p.y + (dy / dist) * force;
            glow = 1 - dist / CURSOR_RADIUS;
          }
        }

        p.twinklePhase += p.twinkleSpeed * dt;
        const twinkle = 0.75 + 0.25 * Math.sin(p.twinklePhase);
        const opacity = Math.min(1, p.baseOpacity * twinkle + glow * 0.5);
        const radius = p.baseRadius + glow * 1.4;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${opacity})`;
        ctx.arc(renderX, renderY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    function handlePointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleTouchMove(e) {
      if (!e.touches || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.touches[0].clientX - rect.left;
      pointer.y = e.touches[0].clientY - rect.top;
      pointer.active = true;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      rafId = requestAnimationFrame(step);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}