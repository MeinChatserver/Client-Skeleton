import {Feature} from './Feature';

export class ListGlowFeature implements Feature {
  private container: HTMLElement | null       = null;
  private startTime: number                   = 0;
  private speed: number                       = 2000;
  private colors  = {
    core:   '#FFFFFF',
    inner:  '#F9FFAD',
    outer:  '#CCFF00'
  };

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, container?: HTMLElement): void {
    this.container = container || null;
  }

  onStart(): void {
    this.startTime = performance.now();
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if(!this.container) {
      return;
    }

    const style             = this.container.style as unknown as any;
    const elapsed   = performance.now() - this.startTime;
    const progress  = (elapsed % this.speed) / this.speed;
    const wave      = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
    const spread    = 4 + wave * 10;
    const shadows    = [
      `0 0 2px ${this.colors.core}`,
      `0 0 3px ${this.colors.core}`,
      `0 0 4px ${this.colors.core}`,
      `0 0 5px ${this.colors.core}`,
      `0 0 6px ${this.colors.core}`,
      `0 0 7px ${this.colors.core}`,
      `0 0 5px ${this.colors.inner}`,
      `0 0 6px ${this.colors.inner}`,
      `0 0 7px ${this.colors.inner}`,
      `0 0 ${spread}px ${this.colors.outer}`,
      `0 0 ${spread}px ${this.colors.outer}`,
      `0 0 ${spread + 2}px ${this.colors.outer}`,
      `0 0 ${spread + 2}px ${this.colors.outer}`,
      `0 0 ${spread + 5}px ${this.colors.outer}`,
      `0 0 ${spread + 5}px ${this.colors.outer}`,
      `0 0 ${spread + 8}px ${this.colors.outer}`,
      `0 0 ${spread + 8}px ${this.colors.outer}`
    ].join(', ');

    style.webkitTextStroke  = `5px ${this.colors.outer}`;
    style.paintOrder        = 'stroke fill';
    style.setProperty('text-shadow', shadows, 'important');
  }

  onDestroy(): void {
    if(this.container) {
      this.container.style.removeProperty('text-shadow');
    }
  }

  setContainer(container: HTMLElement): void {
    this.container                  = container;

    if(this.container) {
      const style               = this.container.style as unknown as any;
      style.webkitFontSmoothing = 'antialiased';
      style.fontWeight          = '900';
      style.color               = '#FFFFFF';
      style.lineHeight          = '1.5';
    }
  }
}
