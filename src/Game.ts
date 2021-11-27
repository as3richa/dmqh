enum Move {
  Up = 1,
  Right,
  Down,
  Left,
}

class Game {
  private grid: Uint32Array;
  private fourProbability = 0.05;

  constructor() {
    this.grid = new Uint32Array(16);
  }

  play(move: Move): boolean {
    const squash = (x0: number, y0: number, dx: number, dy: number) => {
      const values = [];
      for (let i = 0; i < 4; ) {
        values.push(this.at(x0 + i * dx, y0 + i * dy));
      }

      let k = 0;

      for (let i = 0; i < values.length; i++) {
        let value = values[i];
        if (i < values.length - 1 && values[i + 1] == values[i]) {
          value++;
          i++;
        }

        this.set(x0 + k * dx, y0 + k * dy, value);
        k++;
      }

      return k < 4;
    };

    const x00 = move == Move.Down ? 3 : 0;
    const y00 = move == Move.Right ? 3 : 0;
    const [dx, dy] = [
      [0.0, 1.0],
      [1.0, 0.0],
      [0.0, -1.0],
      [-1.0, 0.0],
    ][move];
    const dx0 = 1.0 - dx;
    const dy0 = 1.0 - dy;

    let changed = false;

    for (let i = 0; i < 4; i++) {
      changed ||= squash(x00 + i * dx0, y00 + i * dy0, dx, dy);
    }

    if (changed) {
      this.spawn();
    }

    return changed;
  }

  private spawn() {
    const value = Math.random() < this.fourProbability ? 2 : 1;

    const cells = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        if (this.at(x, y) == 0) {
          cells.push([x, y]);
        }
      }
    }

    const [x0, y0] = cells[Math.floor(Math.random() * cells.length)];

    this.set(x0, y0, value);
  }

  private at(x: number, y: number): number {
    return this.grid[4 * y + x];
  }

  private set(x: number, y: number, value: number) {
    this.grid[4 * y + x] = value;
  }
}
