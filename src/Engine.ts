type Entity = {
  primitive: Primitive;
  animator: Animator;
};

class Engine {
  private game: Game;
  private context: CanvasRenderingContext2D;
  private entities: Array<Entity>;

  private static readonly canvasWidth = 500;
  private static readonly canvasHeight = 500;

  private static readonly cellSize = Engine.canvasWidth / 4;

  private static readonly moveTime = 200;

  constructor() {
    this.entities = [];

    this.game = new Game(this.onEvents.bind(this));

    const canvas = document.createElement("canvas");
    canvas.width = Engine.canvasWidth;
    canvas.height = Engine.canvasHeight;
    this.context = canvas.getContext("2d");
    document.body.appendChild(canvas);

    const drawForever = (time: number) => {
      this.drawFrame(time);
      window.requestAnimationFrame(drawForever);
    };
    window.requestAnimationFrame(drawForever.bind(this));

    window.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  private drawFrame(time: number): void {
    this.context.resetTransform();
    this.context.clearRect(0, 0, Engine.canvasWidth, Engine.canvasHeight);

    for (const entity of this.entities) {
      const { x, y, scale, opacity } = entity.animator.at(time);
      this.context.resetTransform();
      this.context.translate(x, y);
      this.context.scale(scale, scale);
      this.context.globalAlpha = opacity;
      entity.primitive.render(this.context);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case "Up":
      case "ArrowUp":
      case "w":
        this.game.play(Move.Up);
        break;

      case "Right":
      case "ArrowRight":
      case "d":
        this.game.play(Move.Right);
        break;

      case "Down":
      case "ArrowDown":
      case "s":
        this.game.play(Move.Down);
        break;

      case "Left":
      case "ArrowLeft":
      case "a":
        this.game.play(Move.Left);
        break;
    }
  }

  private onEvents(events: GameEvents): void {
    const time = performance.now();

    this.entities = [];

    const cellToCanvas = (x: number, y: number) => {
      return { x: (x + 0.5) * Engine.cellSize, y: (y + 0.5) * Engine.cellSize };
    };

    for (const static_ of events.statics) {
      const { x, y } = cellToCanvas(static_.x, static_.y);

      this.entities.push({
        primitive: new Tile(static_.value),
        animator: new StaticAnimator({
          x,
          y,
          scale: Engine.cellSize,
          opacity: 1.0,
        }),
      });
    }

    for (const move of events.moves) {
      const { x: x0, y: y0 } = cellToCanvas(move.x0, move.y0);
      const { x, y } = cellToCanvas(move.x, move.y);

      this.entities.push({
        primitive: new Tile(move.value),
        animator: new InterpolatingAnimator(
          [
            { x: x0, y: y0, scale: Engine.cellSize, opacity: 1.0 },
            { x, y, scale: Engine.cellSize, opacity: 1.0 },
          ],
          [Engine.moveTime],
          time
        ),
      });
    }

    for (const merge of events.merges) {
      const { x: x0, y: y0 } = cellToCanvas(merge.x0, merge.y0);
      const { x: x1, y: y1 } = cellToCanvas(merge.x1, merge.y1);
      const { x, y } = cellToCanvas(merge.x, merge.y);

      this.entities.push({
        primitive: new Tile(merge.value0),
        animator: new InterpolatingAnimator(
          [
            { x: x0, y: y0, scale: Engine.cellSize, opacity: 1.0 },
            { x, y, scale: Engine.cellSize, opacity: 1.0 },
          ],
          [Engine.moveTime],
          time
        ),
      });

      this.entities.push({
        primitive: new Tile(merge.value0),
        animator: new InterpolatingAnimator(
          [
            { x: x1, y: y1, scale: Engine.cellSize, opacity: 1.0 },
            { x, y, scale: Engine.cellSize, opacity: 1.0 },
          ],
          [Engine.moveTime],
          time
        ),
      });
    }

    for (const spawn of events.spawns) {
      const { x, y } = cellToCanvas(spawn.x, spawn.y);

      this.entities.push({
        primitive: new Tile(spawn.value),
        animator: new InterpolatingAnimator(
          [
            { x, y, scale: Engine.cellSize * 0.25, opacity: 0.25 },
            { x, y, scale: Engine.cellSize, opacity: 1.0 },
          ],
          [Engine.moveTime],
          time
        ),
      });
    }
  }
}
