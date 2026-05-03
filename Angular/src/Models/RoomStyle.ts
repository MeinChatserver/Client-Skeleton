export class BackgroundImage {
  file: string | null = null;
  position: string | null = null;

  constructor(data: any = null) {
    if (data) {
      this.file = data.file ?? null;
      this.position = data.position ?? null;
    }
  }

  getFile(): string | null {
    return this.file;
  }

  getPosition(): string | null {
    return this.position;
  }
}

export class Background {
  color: string | null = null;
  image: BackgroundImage | null = null;

  constructor(data: any = null) {
    if (data) {
      this.color = data.color ?? null;
      if (data.image) {
        this.image = new BackgroundImage(data.image);
      }
    }
  }

  getColor(): string | null {
    return this.color;
  }

  getImage(): BackgroundImage | null {
    return this.image;
  }
}

export class OutputColors {
  red: string | null = null;
  green: string | null = null;
  blue: string | null = null;
  default: string | null = null;

  constructor(data: any = null) {
    if (data) {
      this.red = data.red ?? null;
      this.green = data.green ?? null;
      this.blue = data.blue ?? null;
      this.default = data.default ?? null;
    }
  }

  getRed(): string | null {
    return this.red;
  }

  getGreen(): string | null {
    return this.green;
  }

  getBlue(): string | null {
    return this.blue;
  }

  getDefault(): string | null {
    return this.default;
  }
}

export class RankColors {
  enabled: boolean = false;
  colors: Map<string, string> = new Map();

  constructor(data: any = null) {
    if (data) {
      this.enabled = data.enabled ?? false;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'enabled' && typeof value === 'string') {
          this.colors.set(key, value);
        }
      });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getColor(rankId: string | number): string | null {
    return this.colors.get(String(rankId)) ?? null;
  }

  getAllColors(): Map<string, string> {
    return new Map(this.colors);
  }
}

export class RoomStyle {
  enabled: boolean = false;
  output: OutputColors | null = null;
  background: Background | null = null;
  ranks: RankColors | null = null;

  constructor(data: any = null) {
    if (data) {
      this.enabled = data.enabled ?? false;

      if (data.output) {
        this.output = new OutputColors(data.output);
      }

      if (data.background) {
        this.background = new Background(data.background);
      }

      if (data.ranks) {
        this.ranks = new RankColors(data.ranks);
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getOutput(): OutputColors | null {
    return this.output;
  }

  getBackground(): Background | null {
    return this.background;
  }

  getRanks(): RankColors | null {
    return this.ranks;
  }
}
