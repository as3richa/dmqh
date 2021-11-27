type Entity = {
  primitive: Primitive;
  animator: Animator;
};

class Engine {
  private game: Game;
  private context: CanvasRenderingContext2D;
  private entities: Array<Entity> = [];

  private static readonly canvasWidth = 500;
  private static readonly canvasHeight = 500;

  constructor() {
    this.game = new Game(this.onEvents);
    const canvas = document.createElement("canvas");
    canvas.width = Engine.canvasWidth;
    canvas.height = Engine.canvasHeight;
    document.body.appendChild(canvas);

    this.context = canvas.getContext("2d");

    this.entities.push({
      primitive: new BlackRectangle(),
      animator: new InterpolatingAnimator(
        { x: 125, y: 125, scale: 1.2, opacity: 1.0 },
        { x: 250, y: 250, scale: 0.5, opacity: 0.1 },
        performance.now(),
        performance.now() + 150
      ),
    });

    const drawForever = () => {
      this.drawFrame();
      window.requestAnimationFrame(drawForever);
    };
    drawForever();
  }

  private drawFrame(): void {
    const time = performance.now();

    this.context.resetTransform();
    this.context.clearRect(0, 0, Engine.canvasWidth, Engine.canvasHeight);

    for (const entity of this.entities) {
      const { x, y, scale, opacity } = entity.animator.at(time);
      console.log(x, y, scale, opacity);
      this.context.resetTransform();
      this.context.translate(x, y);
      this.context.scale(scale, scale);
      this.context.globalAlpha = opacity;
      entity.primitive.render(this.context);
    }
  }

  private onEvents(events: GameEvents): void {
    console.log(events);
  }
}
