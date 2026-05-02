import { Feature } from './Feature';

export class ListBurnFeature implements Feature {
  private container: HTMLElement | null = null;

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, container?: HTMLElement): void {
    this.container = container || null;
  }

  onStart(): void {
    // Start animation
  }

  onDestroy(): void {
    if (this.container) {
      this.container.style.backgroundImage = '';
      this.container.style.textShadow = '';
    }
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if (!this.container) return;

    // Create internal canvas for fire effect
    const internalCanvas = document.createElement('canvas');
    internalCanvas.width = 200;
    internalCanvas.height = 100;
    const internalContext = internalCanvas.getContext('2d');
    if (!internalContext) return;

    // Simple fire effect - draw gradient
    const gradient = internalContext.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(255, 200, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 1)');
    gradient.addColorStop(1, 'rgba(200, 0, 0, 0.5)');

    internalContext.fillStyle = gradient;
    internalContext.fillRect(0, 0, 200, 100);

    // Set as background
    this.container.style.backgroundImage = `url(${internalCanvas.toDataURL('image/png')})`;
    this.container.style.backgroundSize = 'cover';
    this.container.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
  }
}
