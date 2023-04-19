/*
 * 사각형이 렌더링되는 GameObject다.
 */
import GameObject from "/src/engine/core/game-object.js";

export default class Rect extends GameObject {
  constructor(options) {
    super();
    this.registerOptions(options);
    this.transform.setPivotPositionToCenter();
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  draw() {
    if (this.isFill) {
      this.context2d.fillStyle = `rgba(
        ${this.color.r}, 
        ${this.color.g}, 
        ${this.color.b}
        )`;
      this.context2d.fillRect(
        0,
        0,
        this.transform.size.x,
        this.transform.size.y
      );
    }

    if (this.isStroke) {
      this.context2d.lineWidth = this.strokeWidth;
      this.context2d.strokeStyle = `rgb(
        ${this.strokeColor.r},
        ${this.strokeColor.g},
        ${this.strokeColor.b},
        ${this.strokeColor.a}
        )`;
      this.context2d.strokeRect(
        this.strokeWidth / 2,
        this.strokeWidth / 2,
        this.transform.size.x - this.strokeWidth,
        this.transform.size.y - this.strokeWidth
      );
    }
  }

  registerOptions(options) {
    this.transform.size.x = options.width || 0;
    this.transform.size.y = options.height || 0;
    this.isFill = options.hasOwnProperty("color");
    this.color = options.color || this.color;
    this.isStroke = options.hasOwnProperty("strokeColor");
    this.strokeColor = options.strokeColor;
    this.strokeWidth = options.strokeWidth || 0;
  }
}
