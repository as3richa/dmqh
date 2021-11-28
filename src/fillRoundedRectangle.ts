function fillRoundedRectangle(
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number
): void {
  const right = left + width;
  const bottom = top + height;

  context.beginPath();
  context.moveTo(left + radius, top);
  context.arcTo(right, top, right, bottom, radius);
  context.arcTo(right, bottom, left, bottom, radius);
  context.arcTo(left, bottom, left, top, radius);
  context.arcTo(left, top, right, top, radius);
  context.closePath();
  context.fill();
}
