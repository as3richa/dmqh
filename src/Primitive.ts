abstract class Primitive {
  abstract render(context: CanvasRenderingContext2D): void;
}

class Tile extends Primitive {
  private text: string;
  private tileColor: string;
  private textColor: string;
  private radius: number;
  private font: SevenSegmentFont;

  private static readonly lightTextColor = "#eeeeee";
  private static readonly darkTextColor = "#1e1e1e";

  private static readonly colors = [
    ["#4ec9b0", Tile.lightTextColor],
    ["#4fc1ff", Tile.lightTextColor],
    ["#569cd6", Tile.lightTextColor],
    ["#9cdcfe", Tile.darkTextColor],
    ["#b5cea8", Tile.darkTextColor],
    ["#c586c0", Tile.lightTextColor],
    ["#c8c8c8", Tile.darkTextColor],
    ["#ce9178", Tile.darkTextColor],
    ["#d16969", Tile.lightTextColor],
    ["#d7ba7d", Tile.darkTextColor],
    ["#dcdcaa", Tile.darkTextColor],
  ];

  constructor(value: number, radius: number) {
    super();

    this.text = (1 << value).toString();

    [this.tileColor, this.textColor] =
      Tile.colors[(value - 1) % Tile.colors.length];

    this.radius = radius;

    const fontSize = Math.min(
      0.7,
      0.7 / (this.text.length * SevenSegmentFont.aspectRatio)
    );
    this.font = new SevenSegmentFont(fontSize);
  }

  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.tileColor;
    fillRoundedRectangle(context, -0.5, -0.5, 1, 1, this.radius);
    context.fillStyle = this.textColor;
    this.font.fillText(context, this.text, 0, 0, "center");
  }
}

class RoundedSquare extends Primitive {
  private color: string;
  private radius: number;

  constructor(color: string, radius: number) {
    super();
    this.color = color;
    this.radius = radius;
  }

  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.color;
    fillRoundedRectangle(context, -0.5, -0.5, 1.0, 1.0, this.radius);
  }
}

class Textual extends Primitive {
  private text: string;
  private color: string;
  private align: "topleft" | "center";
  private font: SevenSegmentFont;

  constructor(text: string, color: string, align: "topleft" | "center") {
    super();
    this.text = text;
    this.color = color;
    this.align = align;
    this.font = new SevenSegmentFont(1);
  }

  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.color;
    this.font.fillText(context, this.text, 0, 0, this.align);
  }
}
