export default class Color {
  constructor() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
  }

  toRGBA() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}
