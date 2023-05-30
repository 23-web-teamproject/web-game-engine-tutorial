/**
 * 수학에서 말하는 그 벡터인데, 웹브라우저는 2차원이니까 차원이 2인 벡터를 말한다.
 */
class Vector {
  /**
   * @constructor
   * @param {number} x - x좌표
   * @param {number} y - y좌표
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * (0, 0)을 갖는 벡터를 반환합니다.
   *
   * @type {Vector}
   */
  static get zero() {
    return new Vector(0, 0);
  }

  /**
   * (0, -1)을 갖는 벡터를 반환합니다.
   *
   * @type {Vector}
   */
  static get up() {
    return new Vector(0, -1);
  }

  /**
   * (0, 1)을 갖는 벡터를 반환합니다.
   *
   * @type {Vector}
   */
  static get down() {
    return new Vector(0, 1);
  }

  /**
   * (1, 0)을 갖는 벡터를 반환합니다.
   *
   * @type {Vector}
   */
  static get right() {
    return new Vector(1, 0);
  }

  /**
   * (-1, 0)을 갖는 벡터를 반환합니다.
   *
   * @type {Vector}
   */
  static get left() {
    return new Vector(-1, 0);
  }

  /**
   * 이 벡터와 x축 사이의 각도(degree)를 반환한다.
   *
   * @returns {Vector}
   */
  getDegree() {
    // 음수를 곱하는 이유는 브라우저상의 xy축과 수학의 xy축이 다르기 때문이다.
    return (Math.atan2(-this.y, this.x) * 180) / Math.PI;
  }

  /**
   * 이 벡터와 다른 벡터간 내적을 한 결과를 반환한다.
   *
   * @param {Vector} other - 내적의 대상 벡터
   * @returns {number}
   */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * 이 벡터의 물리적인 크기(다른 말로는 norm, magnitude)를 반환한다.
   *
   * @returns {number}
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * 이 벡터의 물리적인 크기를 반환하되, 제곱근연산을 하지 않은 채로 반환한다.
   *
   * @returns {number}
   */
  squareLength() {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * 이 벡터에 다른 벡터를 더한 벡터를 반환한다.
   *
   * @param {Vector} other - 이 벡터에 덧셈 연산을 할 벡터
   * @returns {Vector}
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  /**
   * 이 벡터에 다른 벡터를 뺀 벡터를 반환한다.
   *
   * @param {Vector} other - 이 벡터에 뺄셈 연산을 할 벡터
   * @returns {Vector}
   */
  minus(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  /**
   * 이 벡터에 스칼라곱을 한 벡터를 반환한다.
   *
   * @param {number} scalar - 이 벡터에 스칼라 곱셈을 할 값
   * @returns {Vector}
   */
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  /**
   * 이 벡터를 단위벡터로 바꾸어 반환한다.
   *
   * @returns {Vector}
   */
  normalize() {
    const length = this.length();
    if (length === 0) {
      return new Vector(0, 0);
    }
    return new Vector(this.x / length, this.y / length);
  }

  /**
   * 이 벡터의 성분이 다른 벡터의 성분과 일치한다면 true를 반환한다.
   *
   * @param {Vector} other - 이 벡터와 동일한지 확인할 벡터
   * @returns {boolean}
   */
  isEquals(other) {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * 이 벡터와 다른 벡터와 성분끼리 곱해 만든 벡터를 반환한다.
   *
   * @param {Vector} other - 이 벡터와 성분곱을 할 벡터
   * @returns {Vector}
   */
  elementMultiply(other) {
    return new Vector(this.x * other.x, this.y * other.y);
  }
}

export default Vector;
