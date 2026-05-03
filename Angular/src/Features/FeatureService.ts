import { Injectable } from '@angular/core';
import { Feature } from './Feature';
import { SnowFeature } from './SnowFeature';

export enum FeatureType {
  SNOW = 'SNOW'
}

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private features: Map<string, Feature>            = new Map();
  private animationFrameId: number | null           = null;
  private canvas: HTMLCanvasElement | null          = null;
  private context: CanvasRenderingContext2D | null  = null;
  private isRunning                         = false;

  initialize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this.canvas   = canvas;
    this.context  = context;
  }

  addFeature(type: FeatureType): void {
    this.addFeatureWithKey(type, type);
  }

  addFeatureWithKey(type: FeatureType, key: string): void {
    if(!this.canvas || !this.context) {
      console.warn('[FeatureService] Canvas not initialized');
      return;
    }

    if(this.features.has(key)) {
      console.log(`[FeatureService] Feature with key ${key} already exists`);
      return;
    }

    let feature: Feature;

    switch(type) {
      case FeatureType.SNOW:
        feature = new SnowFeature();
      break;
      default:
        console.warn(`[FeatureService] Unknown feature type: ${type}`);
      return;
    }

    feature.onInit(this.canvas, this.context);
    feature.onStart();

    this.features.set(key, feature);
  }

  removeFeature(type: FeatureType | string): void {
    const feature = this.features.get(type as string);

    if(feature) {
      feature.onDestroy();
      this.features.delete(type as string);
    }
  }

  removeAllFeatures(): void {
    for(const feature of this.features.values()) {
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
    if(this.isRunning) {
      return;
    }

    this.isRunning = true;

    const animate = (timestamp: number) => {
      if(!this.canvas || !this.context) {
        return;
      }

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for(const feature of this.features.values()) {
        feature.onPaint(this.context, timestamp);
      }

      if(this.features.size > 0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if(this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isRunning = false;
  }

  resume(): void {
    if(this.features.size > 0 && !this.isRunning) {
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
