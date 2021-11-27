abstract class Primitive {
  abstract render(context: CanvasRenderingContext2D): void;
}

class RedRectangle extends Primitive {
  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#ff0000";
    context.fillRect(-0.5, -0.5, 1.0, 1.0);
  }
}
