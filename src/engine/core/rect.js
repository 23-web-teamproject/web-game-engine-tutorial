/*
 * 사각형이 렌더링되는 GameObject다.
 */
import Vector from "/src/engine/data-structure/vector.js";
import Color from "/src/engine/data-structure/color.js";
import GameObject from "/src/engine/core/game-object.js";

export default class Rect extends GameObject {
  constructor(options = {}) {
    super(options);

    const size = new Vector(0, 0);
    if (typeof options.width === "number") {
      size.x = options.width;
    }
    if (typeof options.height === "number") {
      size.y = options.height;
    }

    this.transform.size = size;
    console.log(size);
    this.transform.setPivotPositionToCenter();

    this.isFill = options.hasOwnProperty("color");
    this.isStroke = options.hasOwnProperty("strokeColor");

    if (this.isStroke) {
      if (options.strokeColor instanceof Color) {
        this.strokeColor = options.strokeColor;
      } else {
        this.strokeColor = new Color(255, 255, 255, 1);
      }

      if (typeof options.strokeWidth === "number") {
        this.strokeWidth = options.strokeWidth;
      } else {
        this.strokeWidth = 1;
      }
    }
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
      this.context2d.fillRect(0, 0, this.getSize().x, this.getSize().y);
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
        this.getSize().x - this.strokeWidth,
        this.getSize().y - this.strokeWidth
      );
    }
  }
}
