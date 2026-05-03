import { Feature } from './Feature';

export class ListBurnFeature implements Feature {
  private static readonly SHIFT_THRESHOLD = 40;
  private static readonly SPARK_WIDTH = 5;
  private static readonly SPARK_HEIGHT = 3;
  private static readonly IGNITE_VALUE = 700;
  private static readonly COOL_VALUE = 365;
  private static readonly INTENSITY_THRESHOLDS = [4, 12, 20, 30];
  private static readonly LINE_HEIGHT = 1;
  private static readonly TICKS_PER_SECOND = 70;
  private static readonly MIN_BUF_HEIGHT = 16;
  private static readonly COOL_DECAY = 16;
  private static readonly RANDOM_BAND_RATIO = 0.25;

  private static COLORS_WARM: Int32Array = new Int32Array(0);
  private static COLORS_COLD: Int32Array = new Int32Array(0);
  private static colorsInitialized = false;
  private container: HTMLElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private overlayContext: CanvasRenderingContext2D | null = null;
  private image: ImageData | null = null;
  private bufWidth = 0;
  private bufHeight = 0;
  private viewWidth = 0;
  private viewHeight = 0;
  private randomBand = 0;
  private morphTargets: Int32Array = new Int32Array(0);
  private colorMap: Int32Array = new Int32Array(0);
  private touchedChildren: HTMLElement[] = [];
  private restoreContainerPosition: string | null = null;
  private restoreContainerOverflow: string | null = null;
  private shift = 0;
  private running = false;
  private lastTickTime = 0;

  constructor() {
    if(!ListBurnFeature.colorsInitialized) {
      ListBurnFeature.initializeColors();
      ListBurnFeature.colorsInitialized = true;
    }
  }

  onInit(_canvas: HTMLCanvasElement, _context: CanvasRenderingContext2D | null, container?: HTMLElement): void {
    this.container = container || null;

    if(!this.container) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    this.bufWidth = Math.max(2, Math.floor(rect.width));
    this.bufHeight = Math.max(ListBurnFeature.MIN_BUF_HEIGHT, Math.floor(rect.height));
    this.viewWidth = Math.max(1, Math.ceil(this.bufWidth / ListBurnFeature.LINE_HEIGHT));
    this.viewHeight = Math.max(1, Math.ceil(this.bufHeight / ListBurnFeature.LINE_HEIGHT));
    this.randomBand = Math.max(ListBurnFeature.SPARK_HEIGHT, Math.floor(this.bufHeight * ListBurnFeature.RANDOM_BAND_RATIO));
    this.morphTargets = new Int32Array(this.bufWidth * this.bufHeight);
    this.colorMap = new Int32Array(this.viewWidth * this.viewHeight);

    const computed = window.getComputedStyle(this.container);

    if(computed.position === 'static') {
      this.restoreContainerPosition = this.container.style.position;
      this.container.style.position = 'relative';
    }

    if(computed.overflow === 'visible') {
      this.restoreContainerOverflow = this.container.style.overflow;
      this.container.style.overflow = 'hidden';
    }

    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.width = this.viewWidth;
    this.overlayCanvas.height = this.viewHeight;
    const style = this.overlayCanvas.style;
    style.position = 'absolute';
    style.left = '0';
    style.top = '0';
    style.width = '100%';
    style.height = '100%';
    style.pointerEvents = 'none';
    style.zIndex = '0';
    style.imageRendering = 'pixelated';

    this.overlayContext = this.overlayCanvas.getContext('2d');

    if(this.overlayContext) {
      this.overlayContext.imageSmoothingEnabled = false;
      this.image = this.overlayContext.createImageData(this.viewWidth, this.viewHeight);
    }

    for(const child of Array.from(this.container.children) as HTMLElement[]) {
      if(window.getComputedStyle(child).position === 'static') {
        child.style.position = 'relative';
      }

      if(!child.style.zIndex) {
        child.style.zIndex = '1';
      }

      this.touchedChildren.push(child);
    }

    this.container.insertBefore(this.overlayCanvas, this.container.firstChild);
    this.container.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
  }

  onStart(): void {
    this.running = true;
    this.lastTickTime = performance.now();
  }

  onDestroy(): void {
    this.running = false;

    if(this.overlayCanvas?.parentElement) {
      this.overlayCanvas.parentElement.removeChild(this.overlayCanvas);
    }

    this.overlayCanvas = null;
    this.overlayContext = null;
    this.image = null;

    if(this.container) {
      this.container.style.textShadow = '';

      if(this.restoreContainerPosition !== null) {
        this.container.style.position = this.restoreContainerPosition;
      }

      if(this.restoreContainerOverflow !== null) {
        this.container.style.overflow = this.restoreContainerOverflow;
      }
    }

    for(const child of this.touchedChildren) {
      child.style.zIndex = '';
    }

    this.touchedChildren = [];
  }

  onPaint(_context: CanvasRenderingContext2D, _timestamp: number): void {
    if(!this.running || !this.overlayContext || !this.image) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.lastTickTime;
    let ticks = Math.floor((elapsed * ListBurnFeature.TICKS_PER_SECOND) / 1000);

    if(ticks <= 0) {
      return;
    }

    if(ticks > 20) {
      ticks = 20;
    }

    this.lastTickTime = now;

    while(ticks-- > 0) {
      this.recalculate();
    }

    this.convert();
    this.overlayContext.putImageData(this.image, 0, 0);
  }

  private recalculate(): void {
    this.fillBaseRow();
    this.addRandomSparks();
    this.coolFire();
  }

  private fillBaseRow(): void {
    const m = this.morphTargets;
    const start = this.bufWidth * (this.bufHeight - 1);
    const end = m.length;

    for(let i = start; i < end; i++) {
      m[i] = ListBurnFeature.COOL_VALUE;
    }
  }

  private addRandomSparks(): void {
    this.shift += this.bufWidth;

    while(this.shift > ListBurnFeature.SHIFT_THRESHOLD) {
      this.shift -= ListBurnFeature.SHIFT_THRESHOLD;
      const x = Math.floor(Math.random() * this.bufWidth);
      const y = Math.floor(Math.random() * this.randomBand);
      this.ignite(x - ListBurnFeature.SPARK_WIDTH, this.bufHeight - ListBurnFeature.SPARK_HEIGHT - y);
    }
  }

  private ignite(x: number, y: number): void {
    const m = this.morphTargets;
    const w = this.bufWidth;
    const h = this.bufHeight;

    for(let i = 0; i < ListBurnFeature.SPARK_WIDTH; i++) {
      const px = x + i;

      if(px < 0 || px >= w) {
        continue;
      }

      for(let j = 0; j < ListBurnFeature.SPARK_HEIGHT; j++) {
        const py = y + j;

        if (py < 0 || py >= h) {
          continue;
        }

        m[py * w + px] = ListBurnFeature.IGNITE_VALUE;
      }
    }
  }

  private coolFire(): void {
    const m = this.morphTargets;
    const w = this.bufWidth;
    const end = m.length - w - 1;

    for(let i = 0; i < end; i++) {
      const sum = m[i] + m[i + w] + m[i + w - 1] + m[i + w + 1];
      const v = ((sum + 2) >> 2) - ListBurnFeature.COOL_DECAY;

      m[i] = v < 0 ? 0 : v;
    }
  }

  private convert(): void {
    const m = this.morphTargets;
    const cm = this.colorMap;
    const warm = ListBurnFeature.COLORS_WARM;
    const cold = ListBurnFeature.COLORS_COLD;
    const thresholds = ListBurnFeature.INTENSITY_THRESHOLDS;
    const lineHeight = ListBurnFeature.LINE_HEIGHT;
    const stride = this.bufWidth * lineHeight;
    const mLen = m.length;
    let prevShift = 0;

    for(let y = 0; y < this.viewHeight; y++) {
      const base = y * stride;

      for(let x = 0; x < this.viewWidth; x++) {
        const pi = base + x * lineHeight;
        const intensity = pi < mLen ? m[pi] : 0;
        let color: number;

        if(intensity > 0) {
          color = warm[intensity];
        } else {
          let maxShift = 0;

          for(let row = 1; row <= 5; row++) {
            const sampleIdx = pi + stride * row;

            if(sampleIdx < mLen) {
              const v = m[sampleIdx];
              let shiftAmount = 0;

              for(let t = thresholds.length - 1; t >= 0; t--) {
                if(v >= thresholds[t]) {
                  shiftAmount = t + 1;
                  break;
                }
              }

              const delta = shiftAmount - row + 1;

              if(delta > maxShift) {
                maxShift = delta;
              }
            }
          }

          const idx = (prevShift + maxShift + 1) >> 2;
          prevShift = maxShift;
          color = idx === 0 ? 0 : cold[idx];
        }

        cm[y * this.viewWidth + x] = color;
      }
    }

    const data = this.image!.data;

    for(let i = 0; i < cm.length; i++) {
      const c = cm[i];
      const o = i * 4;

      data[o] = (c >> 16) & 0xff;
      data[o + 1] = (c >> 8) & 0xff;
      data[o + 2] = c & 0xff;
      data[o + 3] = (c >>> 24) & 0xff;
    }
  }

  private static initializeColors(): void {
    ListBurnFeature.COLORS_WARM = new Int32Array(1225);
    ListBurnFeature.COLORS_COLD = new Int32Array(5);

    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_COLD, 0, 5, 0, 0, 0, 0, 0, 0, 0, 212);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 0, 32, 0, 0, 0, 255, 0, 0, 255, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 32, 96, 0, 0, 255, 255, 255, 0, 0, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 96, 160, 255, 0, 0, 255, 255, 255, 0, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 160, 256, 255, 255, 0, 255, 255, 255, 255, 255);
    ListBurnFeature.fillWithColor(ListBurnFeature.COLORS_WARM, 256, 1225, 255, 255, 255, 255, 255, 255, 255, 255);
  }

  private static fillWithColor(
    pixels: Int32Array,
    min: number,
    max: number,
    fromR: number, fromG: number, fromB: number, fromA: number,
    toR: number, toG: number, toB: number, toA: number
  ): void {
    const len = max - min;

    for(let i = 0; i < len; i++) {
      const r = (fromR * (len - i) + toR * i) / len;
      const g = (fromG * (len - i) + toG * i) / len;
      const b = (fromB * (len - i) + toB * i) / len;
      const a = (fromA * (len - i) + toA * i) / len;

      pixels[min + i] = ListBurnFeature.encodeColor(r, g, b, a);
    }
  }

  private static encodeColor(r: number, g: number, b: number, a: number): number {
    const cr = ListBurnFeature.clamp255(r);
    const cg = ListBurnFeature.clamp255(g);
    const cb = ListBurnFeature.clamp255(b);
    const ca = ListBurnFeature.clamp255(a);

    return (ca << 24) | (cr << 16) | (cg << 8) | cb;
  }

  private static clamp255(v: number): number {
    const i = v | 0;

    return i < 0 ? 0 : i > 255 ? 255 : i;
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
  }
}
