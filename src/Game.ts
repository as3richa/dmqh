enum Move {
  Up = 1,
  Right,
  Down,
  Left,
}

type SpawnEvent = {
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

type GameEvents = {
  spawns: Array<SpawnEvent>;
  moves: Array<MoveEvent>;
  merges: Array<MergeEvent>;
  score0: number | null;
  score: number;
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
      spawns: [this.spawn(), this.spawn()],
      moves: [],
      merges: [],
      score0: null,
      score: 0,
      gameOver: false,
    });
  }

  play(move: Move): void {
    const x00 = move == Move.Down ? 3 : 0;
    const y00 = move == Move.Right ? 3 : 0;

    const [dx, dy] = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ][move];

    const dx0 = Math.abs(1 - dx);
    const dy0 = Math.abs(1 - dy);

    const moves: Array<MoveEvent> = [];
    const merges: Array<MergeEvent> = [];

    for (let i = 0; i < 4; i++) {
      const x0 = x00 + i * dx0;
      const y0 = y00 + i * dy0;
      const events = this.squash(x0, y0, dx, dy);
      moves.push(...events.moves);
      merges.push(...events.merges);
    }

    if (moves.length == 0 && merges.length == 0) {
      return;
    }

    this.grid.fill(0);
    for (const move of moves) {
      this.set(move.x, move.y, move.value);
    }
    for (const merge of merges) {
      this.set(merge.x, merge.y, merge.value);
    }

    const score0 = this.score;

    this.score += merges
      .map((merge) => 1 << merge.value0)
      .reduce((total, points) => total + points);

    const spawn = this.spawn();

    this.onEvents({
      moves,
      merges,
      spawns: [spawn],
      score0,
      score: this.score,
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
  private squash(
    x0: number,
    y0: number,
    dx: number,
    dy: number
  ): { moves: Array<MoveEvent>; merges: Array<MergeEvent> } {
    const moves: Array<MoveEvent> = [];
    const merges: Array<MergeEvent> = [];

    const nonEmptyCells: Array<{ x: number; y: number; value: number }> = [];

    for (let i = 0; i < 4; ) {
      const x = x0 + i * dx;
      const y = y0 + i * dy;
      const value = this.at(x, y);

      if (value != 0) {
        nonEmptyCells.push({ x, y, value });
      }
    }

    for (let i = 0, k = 0; i < nonEmptyCells.length; i++) {
      const { x: x0, y: y0, value: value0 } = nonEmptyCells[i];
      const x = x0 + k * dx;
      const y = y0 + k * dy;

      if (
        i < nonEmptyCells.length - 1 &&
        nonEmptyCells[i + 1].value == value0
      ) {
        const { x: x1, y: y1 } = nonEmptyCells[i + 1];
        merges.push({ x0, y0, x1, y1, x, y, value0, value: value0 + 1 });
        i++;
      } else {
        moves.push({ x0, y0, x, y, value: value0 });
      }
    }

    return { moves, merges };
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
