type AnimationState = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

abstract class Animator {
  abstract at(time: number): AnimationState;
}

class StaticAnimator extends Animator {
  state: AnimationState;

  constructor(state: AnimationState) {
    super();
    this.state = state;
  }

  at(time: number): AnimationState {
    return this.state;
  }
}

class InterpolatingAnimator extends Animator {
  state0: AnimationState;
  state: AnimationState;
  startsAt: number;
  endsAt: number;

  constructor(
    state0: AnimationState,
    state: AnimationState,
    startsAt: number,
    endsAt: number
  ) {
    super();
    this.state0 = state0;
    this.state = state;
    this.startsAt = startsAt;
    this.endsAt = endsAt;
  }

  at(time: number): AnimationState {
    const p = Math.min(
      (time - this.startsAt) / (this.endsAt - this.startsAt),
      1.0
    );
    const q = 1.0 - p;

    return {
      x: this.state0.x * q + this.state.x * p,
      y: this.state0.y * q + this.state.y * p,
      scale: this.state0.scale * q + this.state.scale * p,
      opacity: this.state0.opacity * q + this.state.opacity * p,
    };
  }
}
