/*
 * 화면에 원을 보이려면 Circle을 사용하면 된다.
 */
import Color from "/src/engine/data-structure/color.js";

import GameObject from "/src/engine/core/game-object.js";

import { CircleCollider } from "/src/engine/data-structure/collider.js";
import { typeCheck } from "/src/engine/utils.js";

export default class Circle extends GameObject {
  constructor(options = {}) {
    super(options);
    /*
     * 원의 반지름을 의미한다.
     * 기본값은 5다.
     */
    this.radius = typeCheck(options.radius, "number", 5);
    /*
     * 윤곽선을 그릴 것인지를 의미한다.
     * 윤곽선을 그리기 위해서는 옵션에서 strokeColor나 strokeWidth를
     * 설정하면 화면에 나타나게 된다.
     */
    this.isStroke =
      options.hasOwnProperty("strokeColor") ||
      options.hasOwnProperty("strokeWidth");

    if (this.isStroke) {
      /*
       * 윤곽선의 색상을 의미한다.
       * 만약 옵션에서 윤곽선에 대한 정보가 있다면 isStroke는 true로 설정되고
       * 윤곽선의 색상이 설정된다.
       */
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
    /*
     * 윤곽선의 두께를 의미한다.
     * 1~10 사이의 값을 설정할 수 있다.
     * 기본값으로는 1이다.
     */
    this.strokeWidth = typeCheck(options.strokeWidth, "number", 1);
    /*
     * Collision 타입을 원으로 바꾼다.
     */
    this.collider = new CircleCollider();
  }

  draw() {
    this.context2d.beginPath();
    this.context2d.arc(0, 0, this.radius, 0, 2 * Math.PI);
    this.context2d.fillStyle = `rgb(
      ${this.color.r},
      ${this.color.g},
      ${this.color.b}
    )`;
    this.context2d.fill();
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
}
