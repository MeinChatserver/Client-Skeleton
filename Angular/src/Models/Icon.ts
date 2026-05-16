export class Icon {
  path: string | null;
  position: number | null;

  constructor(path: string | null, position: number | null = null) {
    this.path = path;
    this.position = position;
  }

  getPath() {
    return this.path;
  }

  getPosition() {
    return this.position;
  }
}
