import { Feature } from './Feature';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export class GlowFeature implements Feature {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private emissionRate = 5;
  private hueShift = 0;

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.context = context;
    this.particles = [];
  }

  onStart(): void {
    // Any startup logic if needed
  }

  onDestroy(): void {
    this.particles = [];
    this.canvas = null;
    this.context = null;
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if (!this.canvas) return;

    // Update hue continuously
    this.hueShift = (this.hueShift + 1) % 360;

    // Emit new particles
    for (let i = 0; i < this.emissionRate; i++) {
      this.particles.push(this.createParticle());
    }

    // Update and draw particles
    const particlesToKeep: Particle[] = [];

    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.05; // gravity
      particle.life -= 1;

      if (particle.life > 0) {
        particlesToKeep.push(particle);

        const lifeRatio = particle.life / particle.maxLife;
        context.globalAlpha = lifeRatio;

        const hue = (particle.hue + this.hueShift) % 360;
        context.fillStyle = `hsl(${hue}, 100%, 50%)`;

        context.shadowColor = `hsl(${hue}, 100%, 50%)`;
        context.shadowBlur = 15 * lifeRatio;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * lifeRatio, 0, Math.PI * 2);
        context.fill();
      }
    }

    this.particles = particlesToKeep;
    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }

  private createParticle(): Particle {
    if (!this.canvas) {
      throw new Error('Canvas not initialized');
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;

    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 60,
      maxLife: 60,
      size: Math.random() * 4 + 2,
      hue: Math.random() * 60 + 240 // Blues and purples
    };
  }

  setEmissionRate(rate: number): void {
    this.emissionRate = Math.max(1, rate);
  }
}
