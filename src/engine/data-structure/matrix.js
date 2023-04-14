/*
 * css에서 요소의 크기, 회전, 위치를 변환하려면
 * transform: matrix(...)을 이용해야한다.
 * 이 객체는 matrix의 인자가 될 값들을 나타낸다.
 *
 * matrix에 대한 자세한 설명은 아래 url에서 실습해볼 수 있다.
 * https://angrytools.com/css-generator/transform/
 *
 * matrix =
 *   a c x
 *   b d y
 *   0 0 1
 *
 *   a = x크기 * cos(라디안)
 *   b = x크기 * sin(라디안)
 *   c = y크기 * -sin(라디안)
 *   d = y크기 * cos(라디안)
 *   x = x좌표
 *   y = y좌표
 */

export default class Matrix {
  constructor() {
    this.a = 1;
    this.b = 0;
    this.x = 0;
    this.c = 0;
    this.d = 1;
    this.y = 0;
  }

  multiply(other) {
    const result = new Matrix();
    /*
     *           a c x   a c x
     *           b d y * b d y
     *           0 0 1   0 0 1
     *
     *   a*a+c*b    a*c+c*d   a*x+c*y+x*1
     * = b*a+d*b    b*c+d*d   b*x+d*y+y*1
     *         0          0             1
     */
    result.a = this.a * other.a + this.c * other.b;
    result.c = this.a * other.c + this.c * other.d;
    result.x = this.a * other.x + this.c * other.y + this.x;
    result.b = this.b * other.a + this.d * other.b;
    result.d = this.b * other.c + this.d * other.d;
    result.y = this.b * other.x + this.d * other.y + this.y;
    return result;
  }
}
