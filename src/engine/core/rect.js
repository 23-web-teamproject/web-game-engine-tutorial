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
    if (this.isStroke) {
      this.context2d.lineWidth = 15;
      this.context2d.strokeStyle = `rgb(
        ${this.strokeColor.r},
        ${this.strokeColor.g},
        ${this.strokeColor.b}
        )`;
      this.context2d.strokeRect(
        0,
        0,
        this.transform.size.x,
        this.transform.size.y
      );
    }

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
  }

  registerOptions(options) {
    this.color = options.color;
    this.strokeColor = options.strokeColor;
    this.transform.size.x = options.width || 0;
    this.transform.size.y = options.height || 0;
    this.isFill = options.hasOwnProperty("color");
    this.isStroke = options.hasOwnProperty("strokeColor");
  }
}
