import Color from "/src/engine/data-structure/color.js";

import GameObject from "/src/engine/core/game-object.js";

import { CircleCollider } from "/src/engine/data-structure/collider.js";
import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";
import InputManager from "/src/engine/core/input-manager.js";

/**
 * 화면에 원을 그리는 객체다.
 *
 * @extends {GameObject}
 */
class Circle extends GameObject {
  /**
   * @constructor
   * @param {object} options
   * @param {string} [options.name]
   * @param {number} [options.radius]
   * @param {Color} [options.color]
   * @param {number} [options.strokeWidth]
   * @param {Color} [options.strokeColor]
   * @param {boolean} [options.isActive]
   * @param {boolean} [options.isVisible]
   * @param {Layer} [options.layer]
   * @param {boolean} [options.isPhysicsEnable=false]
   * @param {object} [options.boundary]
   * @param {number} [options.boundary.radius]
   * @param {number} [options.boundary.offset]
   * @param {object} [options.transform]
   * @param {Vector} [options.transform.position=new Vector(0, 0)]
   * @param {Vector} [options.transform.scale=new Vector(1, 1)]
   * @param {number} [options.transform.rotation=0]
   * @param {object} [options.rigidbody]
   * @param {number} [options.rigidbody.mass=1]
   * @param {number} [options.rigidbody.bounceness=0.5]
   * @param {number} [options.rigidbody.staticFriction=0.2]
   * @param {number} [options.rigidbody.dynamicFriction=0.1]
   * @param {boolean} [options.rigidbody.isStatic=false]
   * @param {boolean} [options.rigidbody.isGravity=false]
   * @param {boolean} [options.rigidbody.isTrigger=false]
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
     * Collision 타입을 원 형태로 설정한다.
     */
    if (typeof options.boundary !== "object") {
      options.boundary = {};
    }
    options.boundary.radius = typeCheck(
      options.boundary.radius,
      "number",
      this.radius
    );
    this.collider = new CircleCollider(options.boundary);
  }

  /**
   * 월드 좌표계에서 원의 외형을 반환한다.
   * 원의 외형의 크기는 반지름으로 나타내므로,
   * 월드 좌표계에서의 외형의 반지름이 반환된다.
   *
   * 사실 scale이 Vector라서 정확히는 잘못된 함수다.
   * 물리엔진에서 scale값을 고려하고 있지만 원에 대해서는 그렇지 않다.
   * 이 함수에는 worldScale의 x와 y값을 더한 후 2로 나눈 값을 반지름에 곱하고 있다.
   * 가급적이면 원의 scale을 변경하지 않아야 하고,
   * 변경하더라도 scale의 x와 y값을 같은 값으로 설정하여야 정상적으로 작동한다.
   *
   * @returns {number}
   */
  getBoundary() {
    const worldScale = this.getWorldScale();
    return this.collider.getBoundary() * ((worldScale.x + worldScale.y) / 2);
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

  /**
   * 이 객체위에 마우스가 올라가 있는지를 반환한다.
   * 원의 경우 반지름을 이용한 계산을 해야한다.
   *
   * @returns {boolean}
   */
  isMouseOver() {
    const position = this.getWorldPosition();
    const mousePos = InputManager.getMousePos();
    const distance = position.minus(mousePos);
    return distance.squareLength() < this.radius * this.radius;
  }
}

export default Circle;
