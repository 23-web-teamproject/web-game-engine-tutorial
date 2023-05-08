/**
 * canvas에서 객체의 좌표, 회전, 규모를 변경하려면
 * setTransform(...matrix)을 이용해야한다.

 * 이 객체는 matrix의 인자가 될 값들을 나타낸다.
 *
 * matrix에 대한 자세한 설명은 아래 url에서 찾아볼 수 있다.
 * https://angrytools.com/css-generator/transform/
 *
 *     matrix => a = x크기 * cos(라디안)
 *     a c x     b = x크기 * sin(라디안)
 *     b d y     c = y크기 * -sin(라디안)
 *     0 0 1     d = y크기 * cos(라디안)
 *               x = x좌표
 *               y = y좌표
 */
export default class Matrix {
  /**
   * 3x3행렬의 기본행렬의 원소중에 
   * a, b, c, d, x, y위치에 해당하는 값이 초기화된다.
   * 
   * @constructor
   */
  constructor() {
    /** @type {number} */
    this.a = 1;
    /** @type {number} */
    this.b = 0;
    /** @type {number} */
    this.x = 0;
    /** @type {number} */
    this.c = 0;
    /** @type {number} */
    this.d = 1;
    /** @type {number} */
    this.y = 0;
  }

  /**
   * 이 matrix에 인자로 전달받은 matrix를 행렬곱하여 반환한다.
   *
   *      this    other        result
   *     a c x   A C X   aA+cB aC+cD aX+cY+x
   *     b d y * B D Y = bA+dB bC+dD bX+dY+y
   *     0 0 1   0 0 1       0     0       1
   *
   * @param {Matrix} other - 행렬곱을 할 대상
   */
  multiply(other) {
    const result = new Matrix();
    result.a = this.a * other.a + this.c * other.b;
    result.c = this.a * other.c + this.c * other.d;
    result.x = this.a * other.x + this.c * other.y + this.x;
    result.b = this.b * other.a + this.d * other.b;
    result.d = this.b * other.c + this.d * other.d;
    result.y = this.b * other.x + this.d * other.y + this.y;
    return result;
  }
}
