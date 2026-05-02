import { Feature } from './Feature';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  heat: number;
}

export class BurnFeature implements Feature {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private sparks: Spark[] = [];
  private emissionRate = 8;
  private maxSparks = 150;

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.context = context;
    this.sparks = [];
  }

  onStart(): void {
    // Any startup logic if needed
  }

  onDestroy(): void {
    this.sparks = [];
    this.canvas = null;
    this.context = null;
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if (!this.canvas) return;

    // Emit new sparks if below max
    while (this.sparks.length < this.maxSparks) {
      for (let i = 0; i < this.emissionRate && this.sparks.length < this.maxSparks; i++) {
        this.sparks.push(this.createSpark());
      }
      break;
    }

    // Update and draw sparks
    const sparksToKeep: Spark[] = [];

    for (const spark of this.sparks) {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.15; // gravity (more intense than glow)
      spark.vx *= 0.98; // air resistance
      spark.life -= 1;
      spark.heat -= 0.02;

      if (spark.life > 0 && spark.heat > 0) {
        sparksToKeep.push(spark);

        const lifeRatio = spark.life / spark.maxLife;
        const heatRatio = Math.max(0, spark.heat);

        // Color based on heat: white -> yellow -> orange -> red -> dark red
        let color: string;
        if (heatRatio > 0.6) {
          color = '#FFFF99'; // White-yellow
        } else if (heatRatio > 0.4) {
          color = '#FFAA33'; // Yellow-orange
        } else if (heatRatio > 0.2) {
          color = '#FF6633'; // Orange-red
        } else {
          color = '#BB3311'; // Dark red
        }

        context.globalAlpha = Math.max(0, lifeRatio * heatRatio);
        context.fillStyle = color;

        // Draw spark with glow
        context.shadowColor = color;
        context.shadowBlur = 8 * heatRatio;

        const radius = 1.5 * (1 - lifeRatio * 0.5);
        context.beginPath();
        context.arc(spark.x, spark.y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    this.sparks = sparksToKeep;
    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }

  private createSpark(): Spark {
    if (!this.canvas) {
      throw new Error('Canvas not initialized');
    }

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;

    return {
      x: centerX + (Math.random() - 0.5) * 20,
      y: centerY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 80,
      maxLife: 80,
      heat: 1
    };
  }

  setEmissionRate(rate: number): void {
    this.emissionRate = Math.max(1, Math.min(20, rate));
  }

  setMaxSparks(max: number): void {
    this.maxSparks = Math.max(10, max);
  }
}
