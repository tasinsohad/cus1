import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
  vo: number; // Opacity change velocity
}

const PARTICLE_CONFIG = {
  count: 30, // Number of particles
  minRadius: 1,
  maxRadius: 3,
  minSpeed: 0.05,
  maxSpeed: 0.2,
  minOpacity: 0.1,
  maxOpacity: 0.5,
  opacityChangeSpeed: 0.005,
};

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null); // To get parent dimensions

  const getParticleColor = useCallback(() => {
    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'rgba(200, 200, 255, 0.8)'; // Light particles for dark mode
    }
    return 'rgba(100, 100, 150, 0.6)'; // Darker particles for light mode
  }, []);


  const createParticles = useCallback((canvas: HTMLCanvasElement) => {
    particlesArrayRef.current = [];
    const { count, minRadius, maxRadius, minSpeed, maxSpeed, minOpacity, maxOpacity } = PARTICLE_CONFIG;
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * (maxRadius - minRadius) + minRadius;
      const x = Math.random() * (canvas.width - radius * 2) + radius;
      const y = Math.random() * (canvas.height - radius * 2) + radius;
      const vx = (Math.random() - 0.5) * (maxSpeed - minSpeed) + (Math.random() > 0.5 ? minSpeed : -minSpeed);
      const vy = (Math.random() - 0.5) * (maxSpeed - minSpeed) + (Math.random() > 0.5 ? minSpeed : -minSpeed);
      const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;
      
      particlesArrayRef.current.push({
        x,
        y,
        radius,
        vx,
        vy,
        opacity,
        vo: (Math.random() > 0.5 ? 1 : -1) * PARTICLE_CONFIG.opacityChangeSpeed, // Start with random opacity change direction
      });
    }
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particleColor = getParticleColor();

    particlesArrayRef.current.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = particleColor.replace(/(\d(\.\d+)?)\)$/, `${particle.opacity})`); // Apply dynamic opacity
      ctx.fill();
    });
  }, [getParticleColor]);

  const updateParticles = useCallback((canvas: HTMLCanvasElement) => {
    const { minOpacity, maxOpacity } = PARTICLE_CONFIG;
    particlesArrayRef.current.forEach(particle => {
      // Wall collision
      if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
        particle.vx = -particle.vx;
      }
      if (particle.y + particle.radius > canvas.height || particle.y - particle.radius < 0) {
        particle.vy = -particle.vy;
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update opacity
      particle.opacity += particle.vo;
      if (particle.opacity > maxOpacity || particle.opacity < minOpacity) {
        particle.vo = -particle.vo; // Reverse opacity change direction
        particle.opacity = Math.max(minOpacity, Math.min(maxOpacity, particle.opacity)); // Clamp
      }
    });
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updateParticles(canvas);
    drawParticles(ctx, canvas);
    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, [drawParticles, updateParticles]);


  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = containerRef.current?.parentElement;
    if (canvas && parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      createParticles(canvas); // Re-initialize particles for new size
    }
  }, [createParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas(); // Initial size and particle creation

    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Handle theme change to update particle color immediately
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
           // Redraw with new color. No need to recreate particles.
           const ctx = canvas.getContext('2d');
           if(ctx) drawParticles(ctx, canvas);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });


    window.addEventListener('resize', resizeCanvas);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, [animate, resizeCanvas, drawParticles]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default ParticleBackground;