/*
 * 사각형이 렌더링되는 GameObject다.
 */
import Vector from "/src/engine/data-structure/vector.js";
import Color from "/src/engine/data-structure/color.js";
import GameObject from "/src/engine/core/game-object.js";
import { typeCheck } from "/src/engine/utils.js";

export default class Rect extends GameObject {
  constructor(options = {}) {
    super(options);

    const size = new Vector(0, 0);
    size.x = size.y = this.transform.setSize(
      new Vector(
        typeCheck(options.width, "number", 50),
        typeCheck(options.height, "number", 50)
      )
    );

    this.isStroke =
      options.hasOwnProperty("strokeColor") ||
      options.hasOwnProperty("strokeWidth");

    if (this.isStroke) {
      this.strokeColor = typeCheck(
        options.strokeColor,
        Color,
        new Color(
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
          1
        )
      );
    }
    this.strokeWidth = typeCheck(options.strokeWidth, "number", 1);
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  draw() {
    this.context2d.fillStyle = `rgb(
      ${this.color.r},
      ${this.color.g},
      ${this.color.b}
      )`;
    this.context2d.fillRect(
      -this.getSize().x / 2,
      -this.getSize().y / 2,
      this.getSize().x,
      this.getSize().y
    );

    if (this.isStroke) {
      this.context2d.lineWidth = this.strokeWidth;
      this.context2d.strokeStyle = `rgb(
        ${this.strokeColor.r},
        ${this.strokeColor.g},
        ${this.strokeColor.b}
        )`;
      this.context2d.strokeRect(
        this.strokeWidth / 2 - this.getSize().x / 2,
        this.strokeWidth / 2 - this.getSize().y / 2,
        this.getSize().x - this.strokeWidth,
        this.getSize().y - this.strokeWidth
      );
    }
  }
}
