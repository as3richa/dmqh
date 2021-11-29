class SevenSegmentFont {
  private height: number;

  static readonly aspectRatio = 0.5;
  private static readonly characterMargin = 0.1;
  private static readonly segmentThickness = 0.08;
  private static readonly segmentMargin = 0.01;

  private static activeSegments = {
    "0": [
      [0, 2],
      [0, 1, 2, 3],
    ],
    "1": [[], [1, 3]],
    "2": [
      [0, 1, 2],
      [1, 2],
    ],
    "3": [
      [0, 1, 2],
      [1, 3],
    ],
    "4": [[1], [0, 1, 3]],
    "5": [
      [0, 1, 2],
      [0, 3],
    ],
    "6": [
      [0, 1, 2],
      [0, 2, 3],
    ],
    "7": [[0], [1, 3]],
    "8": [
      [0, 1, 2],
      [0, 1, 2, 3],
    ],
    "9": [
      [0, 1, 2],
      [0, 1, 3],
    ],
    d: [
      [1, 2],
      [1, 2, 3],
    ],
    m: [[0], [0, 1, 2, 3]],
    q: [
      [0, 1],
      [0, 1, 3],
    ],
    h: [[1], [0, 2, 3]],
    g: [
      [0, 2],
      [0, 2, 3],
    ],
    a: [
      [0, 1],
      [0, 1, 2, 3],
    ],
    e: [
      [0, 1, 2],
      [0, 1, 2],
    ],
    o: [
      [1, 2],
      [2, 3],
    ],
    v: [[2], [0, 1, 2, 3]],
    r: [[1], [2]],
    " ": [[], []],
  };

  constructor(height: number) {
    this.height = height;
  }

  fillText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    align: "topleft" | "center"
  ): void {
    if (align == "center") {
      x -= (this.characterWidth() * text.length) / 2;
      y -= this.height / 2;
    }

    for (const digit of text) {
      this.fillCharacter(context, digit, x, y);
      x += this.characterWidth();
    }
  }

  private fillCharacter(
    context: CanvasRenderingContext2D,
    character: string,
    x: number,
    y: number
  ): void {
    const xs = [
      x + this.characterMargin(),
      x + this.characterWidth() - this.characterMargin(),
    ];

    const ys = [
      y + this.characterMargin(),
      y + this.height / 2,
      y + this.height - this.characterMargin(),
    ];

    const [horizontal, vertical] = SevenSegmentFont.activeSegments[character];

    for (const segment of horizontal) {
      this.fillHorizontalSegment(context, xs[0], ys[segment], xs[1]);
    }

    for (const segment of vertical) {
      this.fillVerticalSegment(
        context,
        xs[segment % 2],
        ys[segment >> 1],
        ys[(segment >> 1) + 1]
      );
    }
  }

  private fillHorizontalSegment(
    context: CanvasRenderingContext2D,
    x1: number,
    y: number,
    x2: number
  ): void {
    const left = x1 + this.segmentMargin();
    const top = y - this.segmentThickness() / 2;
    const right = x2 - this.segmentMargin();
    const bottom = y + this.segmentThickness() / 2;

    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(left + this.segmentThickness() / 2, top);
    context.lineTo(right - this.segmentThickness() / 2, top);
    context.lineTo(right, y);
    context.lineTo(right - this.segmentThickness() / 2, bottom);
    context.lineTo(left + this.segmentThickness() / 2, bottom);
    context.lineTo(left, y);
    context.closePath();
    context.fill();
  }
  private fillVerticalSegment(
    context: CanvasRenderingContext2D,
    x: number,
    y1: number,
    y2: number
  ): void {
    const left = x - this.segmentThickness() / 2;
    const top = y1 + this.segmentMargin();
    const right = x + this.segmentThickness() / 2;
    const bottom = y2 - this.segmentMargin();

    context.beginPath();
    context.moveTo(x, top);
    context.lineTo(right, top + this.segmentThickness() / 2);
    context.lineTo(right, bottom - this.segmentThickness() / 2);
    context.lineTo(x, bottom);
    context.lineTo(left, bottom - this.segmentThickness() / 2);
    context.lineTo(left, top + this.segmentThickness() / 2);
    context.lineTo(x, top);
    context.closePath();
    context.fill();
  }

  private characterWidth(): number {
    return this.height * SevenSegmentFont.aspectRatio;
  }

  private characterMargin(): number {
    return this.height * SevenSegmentFont.characterMargin;
  }

  private segmentThickness(): number {
    return this.height * SevenSegmentFont.segmentThickness;
  }

  private segmentMargin(): number {
    return this.height * SevenSegmentFont.segmentMargin;
  }
}
