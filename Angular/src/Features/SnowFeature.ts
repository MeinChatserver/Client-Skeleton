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
  private canvas: HTMLCanvasElement | null          = null;
  private context: CanvasRenderingContext2D | null  = null;
  private snowflakes: Snowflake[]                   = [];
  private particleCount                     = 150;
  private gravity                           = 0.02;
  private wind                              = 0.05;
  private windVariance                      = 0.01;
  private currentWind                       = 0;

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this.canvas   = canvas;
    this.context  = context;

    this.initializeSnowflakes();
  }

  onStart(): void {}

  onResize(): void {
    console.log('[SnowFeature] onResize');
    this.initializeSnowflakes();
  }

  onDestroy(): void {
    this.snowflakes = [];
    this.canvas     = null;
    this.context    = null;
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if(!this.canvas) {
      return;
    }

    this.currentWind  += (this.cryptoRandom() - 0.5) * this.windVariance;
    this.currentWind   = Math.max(-this.wind, Math.min(this.wind, this.currentWind));

    for(const snowflake of this.snowflakes) {
      snowflake.x   += snowflake.vx + this.currentWind;
      snowflake.y   += snowflake.vy;
      snowflake.vy   = Math.min(snowflake.vy + this.gravity, 0.5);

      if(snowflake.x < 0) {
        snowflake.x  = this.canvas.width;
      }

      if(snowflake.x > this.canvas.width) {
        snowflake.x  = 0;
      }

      if(snowflake.y > this.canvas.height) {
        snowflake.y  = -(this.cryptoRandom() * 20);
        snowflake.x  = this.cryptoRandom() * this.canvas.width;
        snowflake.vy = this.cryptoRandom() * 0.8 + 0.2;
      }

      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${snowflake.opacity})`;
      context.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 1.5);
      context.fill();
    }
  }

  private initializeSnowflakes(): void {
    if(!this.canvas) {
      return;
    }

    this.snowflakes = [];

    if(this.canvas.height <= 50) {
      setTimeout(this.initializeSnowflakes, 500);
      return;
    }

    for(let i = 0; i < this.particleCount; i++) {
      this.snowflakes.push({
        x:        this.cryptoRandom() * this.canvas.width,
        y:        this.cryptoRandom() * this.canvas.height,
        vx:       (this.cryptoRandom() - 0.5) * 0.3,
        vy:       this.cryptoRandom() * 0.2 + 0.05,
        radius:   this.cryptoRandom() * 2.5 + 1.5,
        opacity:  this.cryptoRandom() * 0.7 + 0.3
      });
    }
  }

  setParticleCount(count: number): void {
    this.particleCount = count;

    if(this.canvas && this.context) {
      this.initializeSnowflakes();
    }
  }

  private cryptoRandom(): number {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
  }
}
