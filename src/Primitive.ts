abstract class Primitive {
  abstract render(context: CanvasRenderingContext2D): void;
}

class Tile extends Primitive {
  private value: number;

  private static readonly colors = [
    "#4ec9b0",
    "#4fc1ff",
    "#569cd6",
    "#9cdcfe",
    "#b5cea8",
    "#c586c0",
    "#c8c8c8",
    "#ce9178",
    "#d16969",
    "#d7ba7d",
    "#dcdcaa",
  ];

  constructor(value: number) {
    super();
    this.value = value;
  }

  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = Tile.colors[(this.value - 1) % Tile.colors.length];
    context.fillRect(-0.5, -0.5, 1.0, 1.0);
  }
}
