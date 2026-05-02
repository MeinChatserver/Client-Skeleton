import { Feature } from './Feature';

export class ListGlowFeature implements Feature {
  private container: HTMLElement | null = null;
  private startTime: number = 0;
  private color: string = 'yellow';
  private min: number = 0.3;
  private max: number = 0.6;
  private speed: number = 3000;

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, container?: HTMLElement): void {
    this.container = container || null;
    if (this.container) {
      this.extractColor();
    }
  }

  onStart(): void {
    this.startTime = performance.now();
  }

  onDestroy(): void {
    if (this.container) {
      this.container.style.textShadow = '';
    }
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if (!this.container) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = (elapsed % this.speed) / this.speed;
    const wave = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
    const size = this.min + (this.max - this.min) * wave;

    this.container.style.textShadow =
      `0 0 ${size}em ${this.color}, ` +
      `0 0 ${size}em ${this.color}, ` +
      `0 0 ${size}em ${this.color}, ` +
      `0 0 ${size}em ${this.color}`;
  }

  private extractColor(): void {
    if (!this.container) return;

    const styles = window.getComputedStyle(this.container);
    const rgb = styles.color.match(/\d+/g);

    if (rgb && rgb.length >= 3) {
      const r = parseInt(rgb[0]);
      const g = parseInt(rgb[1]);
      const b = parseInt(rgb[2]);
      const brightness = (r + g + b) / 3;

      this.color = `rgb(${Math.min(255, brightness * 1.3)}, ${Math.min(255, brightness * 1.2)}, ${Math.max(0, brightness * 0.2)})`;
    }
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
    this.extractColor();
  }
}
