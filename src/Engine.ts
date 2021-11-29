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
  private static readonly canvasHeight = 600;

  private static readonly gridSize = 500;
  private static readonly gridPadding = 8;
  private static readonly gridRadius = 0.02;
  private static readonly gridTop = Engine.canvasHeight - Engine.gridSize;

  private static readonly cellSize =
    (Engine.gridSize - 2 * Engine.gridPadding) / 4;

  private static readonly tileSize = 100;
  private static readonly tileRadius = 0.05;

  private static readonly titleSize = 75;
  private static readonly textSize = 30;

  private static readonly titlePosition = {
    x: Engine.gridPadding,
    y: Engine.gridPadding,
  };

  private static readonly scorePosition = {
    x: Engine.gridSize - Engine.gridPadding - Engine.cellSize / 2,
    y: Engine.gridTop / 2,
  };

  private static readonly gridColor = "#4a4a4a";
  private static readonly emptyCellColor = "#454545";
  private static readonly textColor = "#505050";
  private static readonly pointsTextColor = "#00dd00";
  private static readonly gameOverTextColor = "#ee0000";

  private static readonly moveDuration = 125;
  private static readonly textFadeDuration = 400;

  private static readonly swipeThreshold = Engine.gridSize / 5;

  constructor() {
    this.gameEntities = [];
    this.game = new Game(this.onGameEvents.bind(this));

    this.uiEntities = [];

    this.uiEntities.push({
      primitive: new Textual("dmqh", Engine.textColor, "topleft"),
      animator: new StaticAnimator({
        ...Engine.titlePosition,
        scale: Engine.titleSize,
        opacity: 1.0,
      }),
    });

    this.uiEntities.push({
      primitive: new RoundedSquare(Engine.gridColor, Engine.gridRadius),
      animator: new StaticAnimator({
        x: Engine.gridSize / 2,
        y: Engine.gridTop + Engine.gridSize / 2,
        scale: Engine.gridSize,
        opacity: 1.0,
      }),
    });

    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const { x: canvasX, y: canvasY } = this.cellToCanvas(x, y);
        this.uiEntities.push({
          primitive: new RoundedSquare(
            Engine.emptyCellColor,
            Engine.tileRadius
          ),
          animator: new StaticAnimator({
            x: canvasX,
            y: canvasY,
            scale: Engine.tileSize,
            opacity: 1.0,
          }),
        });
      }
    }

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

    this.handleTouchEvents(canvas);
  }

  private drawFrame(time: number): void {
    this.context.resetTransform();
    this.context.globalAlpha = 1.0;

    this.context.clearRect(0, 0, Engine.canvasWidth, Engine.canvasHeight);

    for (const entity of this.uiEntities.concat(this.gameEntities)) {
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

  private handleTouchEvents(canvas: HTMLCanvasElement): void {
    let origin = null;

    canvas.addEventListener("touchstart", (event) => {
      const bounds = canvas.getBoundingClientRect();
      const touch = event.changedTouches[0];
      origin = {
        x: touch.clientX - bounds.left,
        y: touch.clientY - bounds.top,
      };
    });

    canvas.addEventListener("touchend", (event) => {
      const bounds = canvas.getBoundingClientRect();
      const touch = event.changedTouches[0];
      const point = {
        x: touch.clientX - bounds.left,
        y: touch.clientY - bounds.top,
      };
      const differences = { x: point.x - origin.x, y: point.y - origin.y };

      origin = null;

      if (
        Math.abs(differences.x) > Engine.swipeThreshold !==
        Math.abs(differences.y) > Engine.swipeThreshold
      ) {
        if (Math.abs(differences.x) > Engine.swipeThreshold) {
          this.game.play(differences.x > 0 ? Move.Right : Move.Left);
        } else {
          this.game.play(differences.y > 0 ? Move.Down : Move.Up);
        }
      }
    });
  }

  private onGameEvents(events: GameEvents): void {
    const startsAt = performance.now();

    this.gameEntities = [];

    this.animateStatics(events.statics);
    this.animateScore(events.score, startsAt);

    if (events.moves.length == 0 && events.merges.length == 0) {
      this.animateSpawns(events.spawns, startsAt);
    } else {
      this.animateMoves(events.moves, events.merges, startsAt);
      this.animateSpawns(events.spawns, startsAt + Engine.moveDuration);
      this.animateMerges(events.merges, startsAt + Engine.moveDuration);

      if (events.gameOver) {
        this.animateGameOver(startsAt + 2 * Engine.moveDuration);
      }
    }
  }

  private animateStatics(statics: Array<StaticEvent>): void {
    for (const static_ of statics) {
      const { x, y } = this.cellToCanvas(static_.x, static_.y);

      this.gameEntities.push({
        primitive: new Tile(static_.value, Engine.tileRadius),
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
        primitive: new Tile(move.value, Engine.tileRadius),
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
        primitive: new Tile(merge.value0, Engine.tileRadius),
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
        primitive: new Tile(merge.value0, Engine.tileRadius),
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
        primitive: new Tile(spawn.value, Engine.tileRadius),
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
        primitive: new Tile(merge.value, Engine.tileRadius),
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

  private animateScore(score: ScoreEvent, startsAt: number): void {
    const { x, y } = Engine.scorePosition;

    this.gameEntities.push({
      primitive: new Textual(
        score.score.toString(),
        Engine.textColor,
        "center"
      ),
      animator: new StaticAnimator({
        x,
        y,
        scale: Engine.textSize,
        opacity: 1.0,
      }),
    });

    if (score.difference !== null) {
      this.gameEntities.push({
        primitive: new Textual(
          score.difference.toString(),
          Engine.pointsTextColor,
          "center"
        ),
        animator: new InterpolatingAnimator(
          [
            { x, y, scale: Engine.textSize, opacity: 1.0 },
            { x, y: 0, scale: Engine.textSize, opacity: 0.0 },
          ],
          [Engine.textFadeDuration],
          startsAt
        ),
      });
    }
  }

  private animateGameOver(startsAt: number): void {
    this.gameEntities.push({
      primitive: new Textual("game over", Engine.gameOverTextColor, "center"),
      animator: new InterpolatingAnimator(
        [
          {
            x: Engine.gridSize / 2,
            y: Engine.gridTop + Engine.gridSize / 2,
            scale: Engine.titleSize,
            opacity: 0,
          },
          {
            x: Engine.gridSize / 2,
            y: Engine.gridTop + Engine.gridSize / 2,
            scale: Engine.titleSize,
            opacity: 1,
          },
        ],
        [Engine.textFadeDuration],
        startsAt
      ),
    });
  }

  private cellToCanvas(x: number, y: number): { x: number; y: number } {
    return {
      x: Engine.gridPadding + (x + 0.5) * Engine.cellSize,
      y: Engine.gridTop + Engine.gridPadding + (y + 0.5) * Engine.cellSize,
    };
  }
}
