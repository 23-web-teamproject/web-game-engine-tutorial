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
 *   b = x크기 * -sin(라디안)
 *   c = y크기 * sin(라디안)
 *   d = y크기 * cos(라디안)
 *   x = x좌표
 *   y = y좌표
 */
import Vector from "/src/engine/core/vector.js";

export default class Matrix {
  constructor() {
    this.position = new Vector(0, 0);
    this.scale = new Vector(1, 1);
    this.rotation = 0; // degree
  }
}
