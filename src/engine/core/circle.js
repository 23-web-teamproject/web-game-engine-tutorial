import Color from "/src/engine/data-structure/color.js";

import GameObject from "/src/engine/core/game-object.js";

import { CircleCollider } from "/src/engine/data-structure/collider.js";
import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 화면에 원을 그리는 객체다.
 *
 * @extends {GameObject}
 */
export default class Circle extends GameObject {
  /**
   * @constructor
   * @param {object} options
   * @param {number} [options.radius]
   * @param {Color} [options.color]
   * @param {number} [options.strokeWidth]
   * @param {Color} [options.strokeColor]
   * @param {boolean} [options.isPhysicsEnable]
   * @param {Transform} [options.transform]
   * @param {RigidBody} [options.rigidbody]
   */
  constructor(options = {}) {
    super(options);
    /**
     * 원의 반지름을 의미한다.
     * 기본값은 5다.
     *
     * @type {number}
     */
    this.radius = typeCheck(options.radius, "number", 5);
    /**
     * 윤곽선을 그릴 것인지를 의미한다.
     * 윤곽선을 그리기 위해서는 옵션에서 strokeColor나
     * strokeWidth를 설정하여야한다.
     *
     * @type {boolean}
     */
    this.isStroke =
      options.hasOwnProperty("strokeColor") ||
      options.hasOwnProperty("strokeWidth");

    if (this.isStroke) {
      /**
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
    /**
     * 윤곽선의 두께를 의미한다.
     * 기본값은 1이다.
     * 값의 범위는 1 ~ 15다.
     *
     * @type {number}
     */
    this.setStrokeWidth(options.strokeWidth);
    /**
     * Collision 타입을 원으로 바꾼다.
     */
    this.collider = new CircleCollider();
  }

  /**
   * 화면에 원과 윤곽선을 그린다.
   */
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

  /**
   * 윤곽선의 두께를 설정한다.
   *
   * @param {number} width - 윤곽선의 두께
   */
  setStrokeWidth(width) {
    this.strokeWidth = typeCheckAndClamp(width, "number", 1, 1, 15);
  }
}
