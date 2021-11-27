abstract class Primitive {
  abstract render(context: CanvasRenderingContext2D): void;
}

class BlackRectangle extends Primitive {
  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#ff0000";
    context.fillRect(-100, -100, 200, 200);
  }
}
