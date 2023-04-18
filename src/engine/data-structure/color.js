export default class Color {
  constructor() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
  }

  toRGBA() {
    const clamped = this.clamp();
    return `rgba(${clamped.r}, ${clamped.g}, ${clamped.b}, ${clamped.a})`;
  }

  toRGB() {
    const clamped = this.clamp();
    return `rgb(${clamped.r}, ${clamped.g}, ${clamped.b})`;
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
