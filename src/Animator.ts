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
  private states: Array<AnimationState>;
  private startsAt: Array<number>;

  constructor(
    states: Array<AnimationState>,
    durations: Array<number>,
    startsAt: number
  ) {
    super();

    if (durations.length != states.length - 1) {
      throw new Error("invariant violation");
    }

    this.states = states;
    this.startsAt = [startsAt];

    for (let i = 0; i < durations.length; i++) {
      this.startsAt.push(this.startsAt[i] + durations[i]);
    }
  }

  at(time: number): AnimationState {
    const index = this.startsAt.findIndex((startsAt) => startsAt > time);

    if (index == -1) {
      return this.states[this.states.length - 1];
    }

    if (index == 0) {
      return this.states[0];
    }

    const state0 = this.states[index - 1];
    const state = this.states[index];

    const startsAt = this.startsAt[index - 1];
    const endsAt = this.startsAt[index];

    const p = (time - startsAt) / (endsAt - startsAt);
    const q = 1.0 - p;

    return {
      x: state0.x * q + state.x * p,
      y: state0.y * q + state.y * p,
      scale: state0.scale * q + state.scale * p,
      opacity: state0.opacity * q + state.opacity * p,
    };
  }
}
