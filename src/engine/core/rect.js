import Color from "/src/engine/data-structure/color.js";
import Vector from "/src/engine/data-structure/vector.js";

import GameObject from "/src/engine/core/game-object.js";

import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 화면에 사각형을 그리는 객체다.
 *
 * @extends {GameObject}
 */
class Rect extends GameObject {
  /**
   * @constructor
   * @param {object} options
   * @param {string} [options.name]
   * @param {number} [options.width]
   * @param {number} [options.height]
   * @param {boolean} [options.isActive]
   * @param {boolean} [options.isVisible]
   * @param {Layer} [options.layer]
   * @param {Color} [options.color=Random Color]
   * @param {boolean} [options.isPhysicsEnable=false]
   * @param {object} [options.boundary]
   * @param {number} [options.boundary.width]
   * @param {number} [options.boundary.height]
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
    // 만약 boundary가 주어지지 않았고 width와 height가 주어졌다면
    // boundary를 width와 height로 설정한다.
    if (typeof options.boundary !== "object") {
      options.boundary = {};
    }
    if (typeof options.width === "number") {
      options.boundary.width = typeCheck(
        options.boundary.width,
        "number",
        options.width
      );
    }
    if (typeof options.height === "number") {
      options.boundary.height = typeCheck(
        options.boundary.height,
        "number",
        options.height
      );
    }

    super(options);
    /**
     * 사각형의 가로, 세로를 의미한다.
     * 기본값은 50이다.
     * width속성에 저장하지 않고 transform의 size에 저장한다.
     */
    this.transform.setSize(
      new Vector(
        typeCheck(options.width, "number", 50),
        typeCheck(options.height, "number", 50)
      )
    );

    if (typeof options.boundary !== "object") {
      options.boundary = new Object();
    }
    if (
      typeof options.boundary.width !== "number" &&
      typeof options.width === "number"
    ) {
      options.boundary.width = typeCheck(options.width, "number", 0);
    }
    if (
      typeof options.boundary.height !== "number" &&
      typeof options.height === "number"
    ) {
      options.boundary.height = typeCheck(options.height, "number", 0);
    }
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
       *
       * @type {Color}
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
  }

  /**
   * 화면에 사각형과 윤곽선을 그린다.
   */
  draw() {
    this.context2d.fillStyle = `rgb(
      ${this.color.r},
      ${this.color.g},
      ${this.color.b}
      )`;
    const size = this.getSize();
    this.context2d.fillRect(-size.x / 2, -size.y / 2, size.x, size.y);

    // 윤곽선을 그리도록 설정했다면 윤곽선을 렌더링한다.
    if (this.isStroke) {
      this.context2d.lineWidth = this.strokeWidth;
      this.context2d.strokeStyle = `rgb(
        ${this.strokeColor.r},
        ${this.strokeColor.g},
        ${this.strokeColor.b}
        )`;
      this.context2d.strokeRect(
        this.strokeWidth / 2 - size.x / 2,
        this.strokeWidth / 2 - size.y / 2,
        size.x - this.strokeWidth,
        size.y - this.strokeWidth
      );
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

export default Rect;
