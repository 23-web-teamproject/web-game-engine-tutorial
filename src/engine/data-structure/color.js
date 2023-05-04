/*
 * Canvas에서 style을 변경할 때 색상값을 입히기 위해 사용할 색상값을 담고 있다.
 * 보통 Canvas에서 RGBA만 사용가능하기 때문에 각각의 값들을 프로퍼티로 갖는다.
 */
import { clamp } from "/src/engine/utils.js";

export default class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /*
   * 각각의 색상값을 배열로 담아 반환한다.
   * 반환 형태는 [r, g, b, a] 이다.
   */
  toArray() {
    const clamped = this.clamp();
    return [clamped.r, clamped.g, clamped.b, clamped.a];
  }

  /*
   * 각각의 색상값을 0~255 사이로 한정시켜 반환한다.
   * Alpha값은 0~1 사이로 한정되어 반환된다.
   */
  clamp() {
    const clamped = new Color();
    clamped.r = clamp(this.r, 0, 255);
    clamped.g = clamp(this.g, 0, 255);
    clamped.b = clamp(this.b, 0, 255);
    clamped.a = clamp(this.a, 0, 1);
    return clamped;
  }
}
