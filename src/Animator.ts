abstract class Primitive {
  abstract render(context: CanvasRenderingContext2D);
}

type AnimationState = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

abstract class Animator {
  abstract at(time: number): AnimationState;
}
