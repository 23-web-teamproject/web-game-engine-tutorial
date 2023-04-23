import GameObject from "/src/engine/core/game-object.js";
import { CircleCollider } from "/src/engine/data-structure/collider.js";

export default class Circle extends GameObject {
  constructor(options) {
    super();
    this.registerOptions(options);
    this.transform.setPivotPositionToCenter();
    this.collider = new CircleCollider();
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  draw() {
    if (this.isFill) {
      this.context2d.beginPath();
      this.context2d.arc(0, 0, this.radius, 0, 2 * Math.PI); // 항상 원을 그린다.
      this.context2d.fillStyle = `rgb(
        ${this.color.r},
        ${this.color.g},
        ${this.color.b}
      )`;
      this.context2d.fill();
    }
    if (this.isStroke) {
      this.context2d.lineWidth = this.strokeWidth;
      this.context2d.beginPath();
      this.context2d.arc(
        0,
        0,
        this.radius - this.strokeWidth / 2,
        0,
        2 * Math.PI
      );
      this.context2d.strokeStyle = `rgb(
        ${this.strokeColor.r},
        ${this.strokeColor.g},
        ${this.strokeColor.b}
        )`;
      this.context2d.stroke();
    }
  }

  registerOptions(options) {
    this.radius = options.radius || 5;
    this.isFill = options.hasOwnProperty("color");
    this.color = options.color || this.color;
    this.isStroke = options.hasOwnProperty("strokeColor");
    this.strokeColor = options.strokeColor;
    this.strokeWidth = options.strokeWidth || 0;
  }
}
