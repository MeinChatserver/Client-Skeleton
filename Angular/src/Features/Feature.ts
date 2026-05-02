export interface Feature {
  onInit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void;
  onStart(): void;
  onDestroy(): void;
  onPaint(context: CanvasRenderingContext2D, timestamp: number): void;
}
