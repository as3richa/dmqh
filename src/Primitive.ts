abstract class Primitive {
  abstract render(context: CanvasRenderingContext2D): void;
}

class Tile extends Primitive {
  private value: number;

  private static readonly colors = [
    "#abb2bf",
    "#c678dd",
    "#56b6c2",
    "#61afef",
    "#5c6370",
    "#98c379",
    "#d19a66",
    "#e5c07b",
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
