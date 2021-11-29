enum Move {
  Up = 0,
  Right,
  Down,
  Left,
}

type SpawnEvent = {
  x: number;
  y: number;
  value: number;
};

type StaticEvent = {
  x: number;
  y: number;
  value: number;
};

type MoveEvent = {
  x0: number;
  y0: number;
  x: number;
  y: number;
  value: number;
};

type MergeEvent = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x: number;
  y: number;
  value0: number;
  value: number;
};

type ScoreEvent = {
  score: number;
  difference: number | null;
};

type GameEvents = {
  statics: Array<StaticEvent>;
  spawns: Array<SpawnEvent>;
  moves: Array<MoveEvent>;
  merges: Array<MergeEvent>;
  score: ScoreEvent;
  gameOver: boolean;
};

class Game {
  private grid: Uint32Array;
  private score: number;
  private readonly onEvents: (events: GameEvents) => void;

  private static readonly fourProbability = 0.05;

  constructor(onEvents: (events: GameEvents) => void) {
    this.grid = new Uint32Array(16);
    this.onEvents = onEvents;
    this.reset();
  }

  reset() {
    this.grid.fill(0);
    this.score = 0;

    this.onEvents({
      statics: [],
      spawns: [this.spawn(), this.spawn()],
      moves: [],
      merges: [],
      score: {
        score: 0,
        difference: null,
      },
      gameOver: false,
    });
  }

  play(move: Move): void {
    const x00 = move == Move.Right ? 3 : 0;
    const y00 = move == Move.Down ? 3 : 0;

    const [dx, dy] = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0],
    ][move];

    const dx0 = 1 - Math.abs(dx);
    const dy0 = 1 - Math.abs(dy);

    const statics: Array<StaticEvent> = [];
    const moves: Array<MoveEvent> = [];
    const merges: Array<MergeEvent> = [];

    for (let i = 0; i < 4; i++) {
      const x0 = x00 + i * dx0;
      const y0 = y00 + i * dy0;
      const events = this.compactLine(x0, y0, dx, dy);
      statics.push(...events.statics);
      moves.push(...events.moves);
      merges.push(...events.merges);
    }

    if (moves.length == 0 && merges.length == 0) {
      return;
    }

    this.grid.fill(0);
    const tiles = statics.concat(moves).concat(merges);
    for (const tile of tiles) {
      this.set(tile.x, tile.y, tile.value);
    }

    const scoreDifference =
      merges.length == 0
        ? null
        : merges
            .map((merge) => 1 << merge.value)
            .reduce((total, points) => total + points);
    this.score += scoreDifference || 0;

    const spawns = [this.spawn()];

    this.onEvents({
      statics,
      moves,
      merges,
      spawns,
      score: {
        score: this.score,
        difference: scoreDifference,
      },
      gameOver: this.gameOver(),
    });
  }

  private spawn(): SpawnEvent {
    const value = Math.random() < Game.fourProbability ? 2 : 1;

    const cells: Array<{ x: number; y: number }> = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        if (this.at(x, y) == 0) {
          cells.push({ x, y });
        }
      }
    }

    const { x, y } = cells[Math.floor(Math.random() * cells.length)];
    this.set(x, y, value);

    return { x, y, value };
  }

  private compactLine(
    x0: number,
    y0: number,
    dx: number,
    dy: number
  ): {
    statics: Array<StaticEvent>;
    moves: Array<MoveEvent>;
    merges: Array<MergeEvent>;
  } {
    const statics: Array<StaticEvent> = [];
    const moves: Array<MoveEvent> = [];
    const merges: Array<MergeEvent> = [];

    const nonEmptyCells: Array<{ x: number; y: number; value: number }> = [];
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * dx;
      const y = y0 + i * dy;
      const value = this.at(x, y);

      if (value != 0) {
        nonEmptyCells.push({ x, y, value });
      }
    }

    for (let i = 0, k = 0; i < nonEmptyCells.length; i++, k++) {
      const { x: x00, y: y00, value: value0 } = nonEmptyCells[i];
      const x = x0 + k * dx;
      const y = y0 + k * dy;

      if (
        i < nonEmptyCells.length - 1 &&
        nonEmptyCells[i + 1].value == value0
      ) {
        const { x: x1, y: y1 } = nonEmptyCells[i + 1];
        merges.push({
          x0: x00,
          y0: y00,
          x1,
          y1,
          x,
          y,
          value0,
          value: value0 + 1,
        });
        i++;
      } else if (x != x00 || y != y00) {
        moves.push({ x0: x00, y0: y00, x, y, value: value0 });
      } else {
        statics.push({ x, y, value: value0 });
      }
    }

    return { statics, moves, merges };
  }

  private gameOver(): boolean {
    if (this.grid.some((value) => value == 0)) {
      return false;
    }

    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const value = this.at(x, y);

        if (x < 3 && this.at(x + 1, y) == value) {
          return false;
        }

        if (y < 3 && this.at(x, y + 1) == value) {
          return false;
        }
      }
    }

    return true;
  }

  private at(x: number, y: number): number {
    return this.grid[4 * y + x];
  }

  private set(x: number, y: number, value: number): void {
    this.grid[4 * y + x] = value;
  }
}
