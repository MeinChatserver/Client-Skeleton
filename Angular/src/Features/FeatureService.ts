import { Injectable } from '@angular/core';
import { Feature } from './Feature';
import { SnowFeature } from './SnowFeature';
import { GlowFeature } from './GlowFeature';
import { BurnFeature } from './BurnFeature';

export enum FeatureType {
  SNOW = 'SNOW',
  GLOW = 'GLOW',
  BURN = 'BURN'
}

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private features: Map<string, Feature> = new Map();
  private animationFrameId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isRunning = false;

  initialize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.context = context;
  }

  addFeature(type: FeatureType): void {
    if (!this.canvas || !this.context) {
      console.warn('[FeatureService] Canvas not initialized');
      return;
    }

    // Remove existing feature of same type
    this.removeFeature(type);

    let feature: Feature;
    switch (type) {
      case FeatureType.SNOW:
        feature = new SnowFeature();
        break;
      case FeatureType.GLOW:
        feature = new GlowFeature();
        break;
      case FeatureType.BURN:
        feature = new BurnFeature();
        break;
      default:
        console.warn(`[FeatureService] Unknown feature type: ${type}`);
        return;
    }

    feature.onInit(this.canvas, this.context);
    feature.onStart();
    this.features.set(type, feature);
  }

  removeFeature(type: FeatureType | string): void {
    const feature = this.features.get(type as string);
    if (feature) {
      feature.onDestroy();
      this.features.delete(type as string);
    }
  }

  removeAllFeatures(): void {
    for (const feature of this.features.values()) {
      feature.onDestroy();
    }
    this.features.clear();
  }

  hasFeature(type: FeatureType | string): boolean {
    return this.features.has(type as string);
  }

  getFeature(type: FeatureType | string): Feature | undefined {
    return this.features.get(type as string);
  }

  startAnimation(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    const animate = (timestamp: number) => {
      if (!this.canvas || !this.context) return;

      // Clear canvas (transparent)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Paint all active features
      for (const feature of this.features.values()) {
        feature.onPaint(this.context, timestamp);
      }

      // Continue animation if features are active
      if (this.features.size > 0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isRunning = false;
  }

  resume(): void {
    if (this.features.size > 0 && !this.isRunning) {
      this.startAnimation();
    }
  }

  cleanup(): void {
    this.stopAnimation();
    this.removeAllFeatures();
    this.canvas = null;
    this.context = null;
  }
}
