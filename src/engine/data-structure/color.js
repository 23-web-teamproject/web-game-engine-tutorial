export default class Color {
  constructor(r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  toArray() {
    const clamped = this.clamp();
    return [clamped.r, clamped.g, clamped.b, clamped.a];
  }

  clamp() {
    const clamped = new Color();
    clamped.r = Math.max(0, Math.min(255, this.r));
    clamped.g = Math.max(0, Math.min(255, this.g));
    clamped.b = Math.max(0, Math.min(255, this.b));
    clamped.a = Math.max(0, Math.min(1, this.a));
    return clamped;
  }
}
