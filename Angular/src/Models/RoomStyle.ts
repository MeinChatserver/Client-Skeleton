export enum BackgroundPosition {
  STRETCHED = 'STRETCHED',
  SCALED_FILL_CENTER_1 = 'SCALED_FILL_CENTER_1',
  SCALED_FILL_CENTER_2 = 'SCALED_FILL_CENTER_2',
  SCALED_FILL_CENTER_3 = 'SCALED_FILL_CENTER_3',
  SCALED_HEIGHT_RIGHT = 'SCALED_HEIGHT_RIGHT',
  SCALED_WIDTH_TOP = 'SCALED_WIDTH_TOP',
  SCALED_WIDTH_BOTTOM = 'SCALED_WIDTH_BOTTOM',
  TILED = 'TILED',
  TILED_ZOOM_2 = 'TILED_ZOOM_2',
  TILED_ZOOM_3 = 'TILED_ZOOM_3',
  TILED_ROWS_OFFSET = 'TILED_ROWS_OFFSET',
  TILED_ROWS_ZOOM_2 = 'TILED_ROWS_ZOOM_2',
  TILED_ROWS_ZOOM_3 = 'TILED_ROWS_ZOOM_3',
  TILED_COLUMNS = 'TILED_COLUMS',
  TILED_COLUMNS_ZOOM_2 = 'TILED_COLUMS_ZOOM_2',
  TILED_COLUMNS_ZOOM_3 = 'TILED_COLUMS_ZOOM_3',
  CENTERED = 'CENTERED',
  CENTERED_2 = 'CENTERED_2',
  CENTERED_3 = 'CENTERED_3'
}

export class BackgroundImage {
  file: string | null = null;
  position: BackgroundPosition | string | null = null;

  constructor(data: any = null) {
    if (data) {
      this.file = data.file ?? null;
      this.position = data.position ?? null;
    }
  }

  getFile(): string | null {
    return this.file;
  }

  getPosition(): BackgroundPosition | string | null {
    return this.position;
  }

  getPositionStyle(imageUrl: string): Partial<CSSStyleDeclaration> {
    const pos = this.position as string;

    const styleMap: { [key: string]: Partial<CSSStyleDeclaration> } = {
      [BackgroundPosition.STRETCHED]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: '100% 100%'
      },
      [BackgroundPosition.SCALED_FILL_CENTER_1]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover'
      },
      [BackgroundPosition.SCALED_FILL_CENTER_2]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'contain'
      },
      [BackgroundPosition.SCALED_FILL_CENTER_3]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'auto'
      },
      [BackgroundPosition.SCALED_HEIGHT_RIGHT]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center right',
        backgroundSize: 'auto 100px'
      },
      [BackgroundPosition.SCALED_WIDTH_TOP]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
        backgroundSize: '100px auto'
      },
      [BackgroundPosition.SCALED_WIDTH_BOTTOM]: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom center',
        backgroundSize: '100px auto'
      },
      [BackgroundPosition.TILED]: {
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: 'auto'
      },
      [BackgroundPosition.TILED_ZOOM_2]: {
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: '200%'
      },
      [BackgroundPosition.TILED_ZOOM_3]: {
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: '300%'
      },
      [BackgroundPosition.TILED_ROWS_OFFSET]: {
        backgroundImage: `url('${imageUrl}'), url('${imageUrl}')`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: '0 0, 50% 50%'
      },
      [BackgroundPosition.TILED_ROWS_ZOOM_2]: {
        backgroundImage: `url('${imageUrl}'), url('${imageUrl}')`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: '0 0, 50% 50%',
        backgroundSize: '200%'
      },
      [BackgroundPosition.TILED_ROWS_ZOOM_3]: {
        backgroundImage: `url('${imageUrl}'), url('${imageUrl}')`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: '0 0, 50% 50%',
        backgroundSize: '300%'
      },
      [BackgroundPosition.TILED_COLUMNS]: {
        backgroundRepeat: 'repeat-y',
        backgroundPosition: '0 0',
        backgroundSize: 'auto'
      },
      [BackgroundPosition.TILED_COLUMNS_ZOOM_2]: {
        backgroundRepeat: 'repeat-y',
        backgroundPosition: '0 0',
        backgroundSize: '200%'
      },
      [BackgroundPosition.TILED_COLUMNS_ZOOM_3]: {
        backgroundRepeat: 'repeat-y',
        backgroundPosition: '0 0',
        backgroundSize: '300%'
      },
      [BackgroundPosition.CENTERED]: {
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat'
      },
      [BackgroundPosition.CENTERED_2]: {
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '200%'
      },
      [BackgroundPosition.CENTERED_3]: {
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '300%'
      }
    };

    return styleMap[pos] || {};
  }

  getCSSRule(imageUrl: string): string {
    const pos = this.position as string;
    const style = this.getPositionStyle(imageUrl);
    const cssProps: string[] = [];

    Object.entries(style).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssProps.push(`${cssKey}: ${value};`);
    });

    return `[data-position="${pos}"] { ${cssProps.join(' ')} }`;
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
