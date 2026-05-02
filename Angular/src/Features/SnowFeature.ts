import { Feature } from './Feature';

interface Snowflake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export class SnowFeature implements Feature {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private snowflakes: Snowflake[] = [];
  private particleCount = 100;
  private gravity = 0.1;
  private wind = 0.05;
  private windVariance = 0.01;
  private currentWind = 0;

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.context = context;
    this.initializeSnowflakes();
  }

  onStart(): void {
    // Any startup logic if needed
  }

  onDestroy(): void {
    this.snowflakes = [];
    this.canvas = null;
    this.context = null;
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if (!this.canvas) return;

    // Update wind with sine wave pattern
    this.currentWind += (Math.random() - 0.5) * this.windVariance;
    this.currentWind = Math.max(-this.wind, Math.min(this.wind, this.currentWind));

    // Update snowflakes
    for (const snowflake of this.snowflakes) {
      snowflake.x += snowflake.vx + this.currentWind;
      snowflake.y += snowflake.vy;
      snowflake.vy += this.gravity;

      // Wrap around canvas
      if (snowflake.x < 0) snowflake.x = this.canvas.width;
      if (snowflake.x > this.canvas.width) snowflake.x = 0;
      if (snowflake.y > this.canvas.height) {
        snowflake.y = -snowflake.radius;
        snowflake.x = Math.random() * this.canvas.width;
      }

      // Draw snowflake
      context.globalAlpha = snowflake.opacity;
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
  }

  private initializeSnowflakes(): void {
    if (!this.canvas) return;

    this.snowflakes = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.snowflakes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5 + 0.2,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
  }

  setParticleCount(count: number): void {
    this.particleCount = count;
    if (this.canvas && this.context) {
      this.initializeSnowflakes();
    }
  }
}
