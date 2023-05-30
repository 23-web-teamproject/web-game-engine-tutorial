/*
 * Canvas에서 style을 변경할 때 색상값을 입히기 위해 사용할 색상값을 담고 있다.
 * 보통 Canvas에서 RGBA만 사용가능하기 때문에 각각의 값들을 프로퍼티로 갖는다.
 */
import { clamp } from "/src/engine/utils.js";

/** rgba에 해당하는 색상값을 나타낸다. */
class Color {
  /**
   * 각각의 rgba값을 설정한다.
   *
   * @param {number} r - 빨간색
   * @param {number} g - 초록색
   * @param {number} b - 파란색
   * @param {number} a - 투명도
   */
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * 각각의 색상값을 배열로 담아 반환한다.
   * 반환 형태는 [r, g, b, a] 이다.
   *
   * @returns {array} 각각의 색상값이 저장된 배열
   */
  toArray() {
    const clamped = this.clamp();
    return [clamped.r, clamped.g, clamped.b, clamped.a];
  }
}

export default Color;
