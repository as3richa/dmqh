type Entity = {
  primitive: Primitive;
  animator: Animator;
};

class Engine {
  private game: Game;
  private context: CanvasRenderingContext2D;
  private uiEntities: Array<Entity>;
  private gameEntities: Array<Entity>;

  private static readonly canvasWidth = 500;
  private static readonly canvasHeight = 650;

  private static readonly gridSize = 500;
  private static readonly gridPadding = 8;
  private static readonly gridRadius = 5;
  private static readonly gridTop = Engine.canvasHeight - Engine.gridSize;

  private static readonly cellSize =
    (Engine.gridSize - 2 * Engine.gridPadding) / 4;
  private static readonly tileSize = 100;

  private static readonly moveDuration = 125;

  constructor() {
    this.gameEntities = [];
    this.game = new Game(this.onGameEvents.bind(this));

    const canvas = document.createElement("canvas");
    canvas.width = Engine.canvasWidth;
    canvas.height = Engine.canvasHeight;
    canvas.style.marginLeft = "auto";
    canvas.style.marginRight = "auto";
    canvas.style.display = "block";
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
    this.context.globalAlpha = 1.0;

    this.context.clearRect(0, 0, Engine.canvasWidth, Engine.canvasHeight);
    this.drawUiElements();

    for (const entity of this.gameEntities) {
      const { x, y, scale, opacity } = entity.animator.at(time);
      this.context.resetTransform();
      this.context.translate(x, y);
      this.context.scale(scale, scale);
      this.context.globalAlpha = opacity;
      entity.primitive.render(this.context);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    let handled = true;

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

      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
    }
  }

  private drawUiElements() {
    this.context.fillStyle = "#4a4a4a";

    fillRoundedRectangle(
      this.context,
      0,
      Engine.gridTop,
      Engine.gridSize,
      Engine.gridSize,
      Engine.gridRadius
    );

    new SevenSegmentFont(50).fillText(
      this.context,
      "0123456789dvqh",
      0,
      0,
      "topleft"
    );
  }

  private onGameEvents(events: GameEvents): void {
    const startsAt = performance.now();

    this.gameEntities = [];

    this.animateStatics(events.statics);

    if (events.moves.length == 0 && events.merges.length == 0) {
      this.animateSpawns(events.spawns, startsAt);
    } else {
      this.animateMoves(events.moves, events.merges, startsAt);
      this.animateSpawns(events.spawns, startsAt + Engine.moveDuration);
      this.animateMerges(events.merges, startsAt + Engine.moveDuration);
    }
  }

  private animateStatics(statics: Array<StaticEvent>): void {
    for (const static_ of statics) {
      const { x, y } = this.cellToCanvas(static_.x, static_.y);

      this.gameEntities.push({
        primitive: new Tile(static_.value),
        animator: new StaticAnimator({
          x,
          y,
          scale: Engine.tileSize,
          opacity: 1,
        }),
      });
    }
  }

  private animateMoves(
    moves: Array<MoveEvent>,
    merges: Array<MergeEvent>,
    startsAt: number
  ): void {
    for (const move of moves) {
      const { x: x0, y: y0 } = this.cellToCanvas(move.x0, move.y0);
      const { x, y } = this.cellToCanvas(move.x, move.y);

      this.gameEntities.push({
        primitive: new Tile(move.value),
        animator: new InterpolatingAnimator(
          [
            { x: x0, y: y0, scale: Engine.tileSize, opacity: 1 },
            { x, y, scale: Engine.tileSize, opacity: 1 },
          ],
          [Engine.moveDuration],
          startsAt
        ),
      });
    }

    for (const merge of merges) {
      const { x: x0, y: y0 } = this.cellToCanvas(merge.x0, merge.y0);
      const { x: x1, y: y1 } = this.cellToCanvas(merge.x1, merge.y1);
      const { x, y } = this.cellToCanvas(merge.x, merge.y);

      this.gameEntities.push({
        primitive: new Tile(merge.value0),
        animator: new InterpolatingAnimator(
          [
            { x: x0, y: y0, scale: Engine.tileSize, opacity: 1 },
            { x, y, scale: Engine.tileSize, opacity: 1 },
            { x, y, scale: Engine.tileSize, opacity: 0 },
          ],
          [Engine.moveDuration, 0],
          startsAt
        ),
      });

      this.gameEntities.push({
        primitive: new Tile(merge.value0),
        animator: new InterpolatingAnimator(
          [
            { x: x1, y: y1, scale: Engine.tileSize, opacity: 1 },
            { x, y, scale: Engine.tileSize, opacity: 1 },
            { x, y, scale: Engine.tileSize, opacity: 0 },
          ],
          [Engine.moveDuration, 0],
          startsAt
        ),
      });
    }
  }

  private animateSpawns(spawns: Array<SpawnEvent>, startsAt: number): void {
    for (const spawn of spawns) {
      const { x, y } = this.cellToCanvas(spawn.x, spawn.y);

      this.gameEntities.push({
        primitive: new Tile(spawn.value),
        animator: new InterpolatingAnimator(
          [
            { x, y, scale: 0, opacity: 0 },
            { x, y, scale: Engine.tileSize, opacity: 1 },
          ],
          [Engine.moveDuration],
          startsAt
        ),
      });
    }
  }

  private animateMerges(merges: Array<MergeEvent>, startsAt: number): void {
    for (const merge of merges) {
      const { x, y } = this.cellToCanvas(merge.x, merge.y);

      this.gameEntities.push({
        primitive: new Tile(merge.value),
        animator: new InterpolatingAnimator(
          [
            { x, y, scale: Engine.tileSize, opacity: 0 },
            { x, y, scale: Engine.tileSize, opacity: 1 },
            { x, y, scale: Engine.cellSize, opacity: 1 },
            { x, y, scale: Engine.tileSize, opacity: 1 },
          ],
          [0, Engine.moveDuration / 2, Engine.moveDuration / 2],
          startsAt
        ),
      });
    }
  }

  private cellToCanvas(x: number, y: number): { x: number; y: number } {
    return {
      x: Engine.gridPadding + (x + 0.5) * Engine.cellSize,
      y: Engine.gridTop + Engine.gridPadding + (y + 0.5) * Engine.cellSize,
    };
  }
}
