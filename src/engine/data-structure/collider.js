import Vector from "/src/engine/data-structure/vector.js";

import { typeCheck } from "/src/engine/utils.js";

/** 충돌처리에서 물체의 외형을 간단하게 표현하기 위해 Collider를 이용한다.*/
class Collider {
  /**
   * @constructor
   * @param {object} options
   * @param {Vector} options.offset
   */
  constructor(options = {}) {
    /**
     * 이 값은 물체의 중심에서 외형의 위치가 얼마나 떨어져 있는지를 나타낸다.
     *
     * @type {Vector}
     */
    this.offset = typeCheck(options.offset, Vector, Vector.zero);
  }

  /**
   * 외형의 오프셋값을 반환한다.
   *
   * @returns {Vector}
   */
  getOffset() {
    return this.offset;
  }

  /**
   * 외형의 오프셋을 특정값으로 설정한다.
   *
   * @param {Vector} offset
   */
  setOffset(offset) {
    this.offset = typeCheck(offset, Vector, this.offset);
  }
}

/**
 * 상자 형태의 외형을 나타낸다.
 * 외형의 크기에 따라 충돌체크의 범위가 달라진다.
 *
 * @extends {Collider}
 * */
class BoxCollider extends Collider {
  /**
   * @constructor
   * @param {object} [options]
   * @param {number} [options.width=0]
   * @param {number} [options.height=0]
   * @param {Vector} [options.offset=new Vector(0, 0)]
   */
  constructor(options = {}) {
    super(options);

    /**
     * 상자의 크기값이다.
     *
     * @type {Vector}
     */
    this.boundary = new Vector(
      typeCheck(options.width, "number", 0),
      typeCheck(options.height, "number", 0)
    );
  }

  /**
   * 외형의 크기를 반환한다.
   *
   * @returns {Vector}
   */
  getBoundary() {
    return this.boundary;
  }

  /**
   * 외형의 크기를 설정한다.
   *
   * @param {Vector} boundary
   */
  setBoundary(boundary) {
    this.boundary = typeCheck(boundary, Vector, this.boundary);
  }
}

/**
 * 원 형태의 외형을 나타낸다.
 * 외형의 크기에 따라 충돌체크의 범위가 달라진다.
 *
 * @extends {Collider}
 * */
class CircleCollider extends Collider {
  /**
   * @constructor
   * @param {object} [options]
   * @param {number} [options.radius=0]
   * @param {Vector} [options.offset=new Vector(0, 0)]
   */
  constructor(options = {}) {
    super(options);

    this.radius = typeCheck(options.radius, "number", 0);
  }

  /**
   * 외형의 크기를 반환한다.
   * 원 형태이므로 반지름을 반환한다.
   *
   * @returns {number}
   */
  getBoundary() {
    return this.radius;
  }

  /**
   * 외형의 크기를 설정한다.
   * 원 형태이므로 반지름의 길이가 외형의 크기가 된다.
   *
   * @param {number} radius
   */
  setBoundary(radius) {
    this.radius = typeCheck(radius, "number", this.radius);
  }
}

export { BoxCollider, CircleCollider };
