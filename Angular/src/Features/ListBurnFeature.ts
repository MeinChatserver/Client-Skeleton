import { Feature } from './Feature';

export class ListBurnFeature implements Feature {
  private static readonly WIDTH_FACTOR = 3;
  private static readonly HEIGHT_FACTOR = 5;
  private static readonly SHIFT_THRESHOLD = 160;
  private static readonly RANDOM_HEIGHT = 24;
  private static readonly SPARK_HEIGHT = 4;
  private static readonly IGNITE_VALUE = 1224;
  private static readonly COOL_VALUE = 280;
  private static readonly INTENSITY_THRESHOLDS = [4, 12, 20, 30];
  private static COLORS_WARM: number[] = [];
  private static COLORS_COLD: number[] = [];

  private container: HTMLElement | null = null;
  private running = false;
  private animationFrameId: number | null = null;

  private width = 200;
  private height = 100;
  private lineHeight = 2;
  private scale = 100;
  private widthNew = Math.ceil(200 / 2);
  private heightNew = Math.ceil((100 * 100) / (2 * 100));

  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private image: ImageData | null = null;
  private colorMap: number[] = [];
  private morphTargets: number[] = [];
  private shift = 0;
  private lightness: number[] = [];

  constructor() {
    this.initializeColors();
  }

  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D | null, container?: HTMLElement): void {
    this.container = container || null;

    if (!this.container) return;

    // Size based on container dimensions
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));

    // Fallback to reasonable defaults if container not yet laid out
    if (this.width <= 0 || this.height <= 0) {
      this.width = 200;
      this.height = 30;
    }

    this.widthNew = Math.ceil(this.width / 2);
    this.heightNew = Math.ceil((this.height * 100) / (2 * 100));

    console.log(`[ListBurnFeature] onInit: container ${this.width}x${this.height}, canvas ${this.widthNew}x${this.heightNew}`);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.widthNew;
    this.canvas.height = this.heightNew;
    this.context = this.canvas.getContext('2d');

    if (!this.context) return;

    this.image = this.context.createImageData(this.widthNew, this.heightNew);
    this.lightness = new Array(this.heightNew * this.widthNew).fill(0);
    this.morphTargets = new Array(this.height * this.width).fill(0);
    this.colorMap = new Array(this.heightNew * this.widthNew).fill(0);

    this.changeStyle();
  }

  onStart(): void {
    this.running = true;
  }

  onDestroy(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.container) {
      this.container.style.backgroundImage = '';
      this.container.style.textShadow = '';
    }
  }

  onPaint(context: CanvasRenderingContext2D, timestamp: number): void {
    if (!this.running || !this.container) {
      return;
    }

    this.recalculate();
    if (this.canvas) {
      const dataUrl = this.canvas.toDataURL('image/png');
      this.container.style.backgroundImage = `url(${dataUrl})`;

      // Debug: Log sample colors
      if (timestamp % 30 === 0) {
        console.log('[ListBurnFeature] Sample morphTargets:', this.morphTargets.slice(this.height * this.width - 20, this.height * this.width));
        console.log('[ListBurnFeature] Sample lightness:', this.lightness.slice(this.heightNew * this.widthNew - 10, this.heightNew * this.widthNew));
      }
    }
  }

  private changeStyle(): void {
    if (this.container) {
      this.container.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
      this.container.style.backgroundSize = '100% 100%';
      this.container.style.backgroundPosition = '0 0';
      this.container.style.backgroundRepeat = 'no-repeat';
    }
  }

  private repaint(): void {
    if (!this.running) {
      return;
    }

    this.recalculate();
    this.animationFrameId = requestAnimationFrame(this.repaint.bind(this));

    if (this.container && this.canvas) {
      this.container.style.backgroundImage = `url(${this.canvas.toDataURL('image/png')})`;
    }
  }

  private recalculate(): void {
    this.createNewPixels();
    this.addRandomSparks();
    this.coolFire();
    this.updateDisplayPixels();
    this.drawToCanvas();
  }

  private createNewPixels(): void {
    this.fillArray(this.morphTargets, this.width * (this.height - 1), this.width * this.height, ListBurnFeature.COOL_VALUE);
  }

  private fillArray(array: number[], start: number, end: number, value: number): void {
    for (let i = start; i < end; i++) {
      array[i] = value;
    }
  }

  private addRandomSparks(): void {
    this.shift += this.width;

    while (this.shift > ListBurnFeature.SHIFT_THRESHOLD) {
      this.shift -= ListBurnFeature.SHIFT_THRESHOLD;
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * ListBurnFeature.RANDOM_HEIGHT);
      this.ignite(x - 7, this.height - 4 - y);
    }
  }

  private ignite(x: number, y: number): void {
    for (let i = 0; i < ListBurnFeature.SPARK_WIDTH; i++) {
      for (let j = 0; j < ListBurnFeature.SPARK_HEIGHT; j++) {
        const idx = (y + j) * this.width + i + x;
        if (idx >= 0 && idx < this.morphTargets.length) {
          this.morphTargets[idx] = ListBurnFeature.IGNITE_VALUE;
        }
      }
    }
  }

  private coolFire(): void {
    const endIndex = this.morphTargets.length - this.width - 1;

    for (let i = 0; i < endIndex; i++) {
      const newVal =
        ((this.morphTargets[i] +
          this.morphTargets[i + this.width] +
          this.morphTargets[i + this.width - 1] +
          this.morphTargets[i + this.width + 1] +
          2) >>
          2) -
        3;
      this.morphTargets[i] = Math.max(0, newVal);
    }
  }

  private updateDisplayPixels(): void {
    let index = 0;
    const canvasRowLength = this.width * this.lineHeight;

    for (let y = 0; y < this.heightNew; y++) {
      const baseIndex = y * canvasRowLength;

      for (let x = 0; x < this.widthNew; x++) {
        let color;
        const pixelIndex = baseIndex + x * this.lineHeight;
        const intensity = this.morphTargets[pixelIndex] || 0;

        if (intensity > 0) {
          color = ListBurnFeature.COLORS_WARM[intensity] || 0;
        } else {
          let maxShift = 0;

          for (let targetIndex = 1; targetIndex <= 5; targetIndex++) {
            const shiftedIndex = pixelIndex + canvasRowLength * targetIndex;

            if (shiftedIndex < this.morphTargets.length) {
              const morphTarget = this.morphTargets[shiftedIndex] || 0;
              let shiftAmount = 0;

              for (let j = ListBurnFeature.INTENSITY_THRESHOLDS.length - 1; j >= 0; j--) {
                if (morphTarget >= ListBurnFeature.INTENSITY_THRESHOLDS[j]) {
                  shiftAmount = j + 1;
                  break;
                }
              }

              const j = shiftAmount - targetIndex + 1;

              if (j > maxShift) {
                maxShift = j;
              }
            }
          }

          const targetIndex = ((index + maxShift + 1) >> 2) % ListBurnFeature.COLORS_COLD.length;
          index = maxShift;
          color = ListBurnFeature.COLORS_COLD[targetIndex] || 0;
        }

        this.lightness[y * this.widthNew + x] = color;
      }
    }

    if (!this.image) return;

    const imageData = this.image.data;

    for (let i = 0; i < this.lightness.length; i++) {
      const color = this.lightness[i];
      const offset = i * 4;

      imageData[offset] = (color >> 16) & 0xff;
      imageData[offset + 1] = (color >> 8) & 0xff;
      imageData[offset + 2] = color & 0xff;
      imageData[offset + 3] = (color >> 24) & 0xff;
    }

    this.context!.putImageData(this.image, 0, 0);
  }

  private drawToCanvas(): void {
    if (!this.context || !this.canvas || !this.image) return;

    this.context.putImageData(this.image, 0, 0);
  }

  private static fillWithColor(
    pixels: number[],
    min: number,
    max: number,
    fromRed: number,
    fromGreen: number,
    fromBlue: number,
    fromAlpha: number,
    toRed: number,
    toGreen: number,
    toBlue: number,
    toAlpha: number
  ): void {
    const segmentLength = max - min;

    for (let index = 0; index < segmentLength; index++) {
      const r = (fromRed * (segmentLength - index) + toRed * index) / segmentLength;
      const g = (fromGreen * (segmentLength - index) + toGreen * index) / segmentLength;
      const b = (fromBlue * (segmentLength - index) + toBlue * index) / segmentLength;
      const a = (fromAlpha * (segmentLength - index) + toAlpha * index) / segmentLength;

      pixels[min + index] = ListBurnFeature.getColor(r, g, b, a);
    }
  }

  private static getColor(red: number, green: number, blue: number, alpha: number): number {
    red = Math.max(0, Math.min(255, red));
    green = Math.max(0, Math.min(255, green));
    blue = Math.max(0, Math.min(255, blue));
    alpha = Math.max(0, Math.min(255, alpha));

    return (alpha << 24) | (red << 16) | (green << 8) | blue;
  }

  private initializeColors(): void {
    ListBurnFeature.COLORS_WARM = new Array(1225).fill(0);
    ListBurnFeature.COLORS_COLD = new Array(256).fill(0);

    // Exact copy from Java original: BLACK -> BLUE -> RED -> YELLOW -> WHITE
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_COLD, 0, 5, 0, 0, 0, 0, 0, 0, 0, 212);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 0, 32, 0, 0, 0, 255, 0, 0, 255, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 32, 96, 0, 0, 255, 255, 255, 0, 0, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 96, 160, 255, 0, 0, 255, 255, 255, 0, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 160, 256, 255, 255, 0, 255, 255, 255, 255, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 256, 1225, 255, 255, 255, 255, 255, 255, 255, 255);
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
  }
}
