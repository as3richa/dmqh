enum SwipeDirection {
  Up = 0,
  Right,
  Down,
  Left,
}

class SwipeHandler {
  private element: HTMLElement;
  private threshold: number;
  private onSwipe: (direction: SwipeDirection) => void;
  private touchOrigin: { x: number; y: number; id: number } | null;
  private boundOnTouchStart: (event: TouchEvent) => void;
  private boundOnTouchEnd: (event: TouchEvent) => void;

  constructor(
    element: HTMLElement,
    threshold: number,
    onSwipe: (direction: SwipeDirection) => void
  ) {
    this.element = element;
    this.threshold = threshold;
    this.onSwipe = onSwipe;
    this.touchOrigin = null;
    this.boundOnTouchStart = this.onTouchStart.bind(this);
    this.boundOnTouchEnd = this.onTouchEnd.bind(this);
    element.addEventListener("touchstart", this.boundOnTouchStart);
    element.addEventListener("touchend", this.boundOnTouchEnd);
  }

  unregister() {
    this.element.removeEventListener("touchstart", this.boundOnTouchStart);
    this.element.removeEventListener("touchend", this.boundOnTouchEnd);
  }

  private onTouchStart(event: TouchEvent): void {
    if (this.touchOrigin !== null) {
      return;
    }
    const touch = event.changedTouches[0];
    this.touchOrigin = {
      ...this.touchToElementCoordinates(touch),
      id: touch.identifier,
    };
  }

  private onTouchEnd(event: TouchEvent): void {
    if (this.touchOrigin === null) {
      return;
    }

    let originalTouch: Touch | null = null;

    for (const touch of event.changedTouches) {
      if (touch.identifier === this.touchOrigin.id) {
        originalTouch = touch;
        break;
      }
    }

    if (originalTouch === null) {
      return;
    }

    const { x, y } = this.touchToElementCoordinates(originalTouch);
    const dx = x - this.touchOrigin.x;
    const dy = y - this.touchOrigin.y;

    this.touchOrigin = null;

    if (Math.abs(dx) > this.threshold !== Math.abs(dy) > this.threshold) {
      let direction: SwipeDirection;

      if (Math.abs(dx) > this.threshold) {
        direction = dx > 0 ? SwipeDirection.Right : SwipeDirection.Left;
      } else {
        direction = dy > 0 ? SwipeDirection.Down : SwipeDirection.Up;
      }

      this.onSwipe(direction);
    }
  }

  private touchToElementCoordinates(touch: Touch): { x: number; y: number } {
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    const elementBoundingBox = this.element.getBoundingClientRect();
    const x = clientX - elementBoundingBox.left;
    const y = clientY - elementBoundingBox.top;
    return { x, y };
  }
}
