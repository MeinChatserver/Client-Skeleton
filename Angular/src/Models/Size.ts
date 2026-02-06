export class Size {
  width: number | null;
  height: number | null;

  constructor(width: number | null, height: number | null) {
    this.width = width;
    this.height = height;
  }

  hasWidth() {
    return this.width !== null;
  }

  getWidth() {
    return this.width;
  }

  hasHeight() {
    return this.height !== null;
  }
  
  getHeight() {
    return this.height;
  }
}
