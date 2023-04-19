/*
 * 수학에서 말하는 그 벡터인데, 웹브라우저는 2차원이니까 차원이 2인 벡터를 말한다.
 */
export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /*
   * 이 벡터와 x축 사이의 각도(degree)를 반환한다.
   */
  getDegree() {
    // 음수를 곱하는 이유는 브라우저상의 xy축과 수학의 xy축이 다르기 때문이다.
    return Math.atan2(-this.y, this.x) * 180 / Math.PI;
  }

  /*
   * 이 벡터와 다른 벡터간 내적을 한 결과를 반환한다.
   */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  /*
   * 이 벡터의 물리적인 크기(다른 말로는 norm, magnitude)를 반환한다.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /*
   * 이 벡터에 다른 벡터를 더한 벡터를 반환한다.
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  /*
   * 이 벡터에 다른 벡터를 뺀 벡터를 반환한다.
   */
  minus(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }
}
