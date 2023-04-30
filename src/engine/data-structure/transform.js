/*
 * GameObject의 좌표, 회전, 축척 등을 나타내기 위해 사용한다.
 * 좌표, 회전, 축척을 한 번에 나타낼 수 있게 matrix형태로 바꾸는 기능도 갖고 있다.
 */
import Vector from "/src/engine/data-structure/vector.js";
import Matrix from "/src/engine/data-structure/matrix.js";
import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

export default class Transform {
  constructor(options = {}) {
    /*
     * 좌표값을 나타낸다. 이 좌표값은 물체의 중심좌표를 말한다.
     */
    this.position = typeCheck(options.position, Vector, new Vector(0, 0));

    /*
     * 축척을 나타낸다.
     */
    this.scale = typeCheck(options.scale, Vector, new Vector(1, 1));

    /*
     * 각도를 나타낸다. 라디안이 아닌 degree를 쓴다.
     */
    this.rotation = typeCheck(options.rotation, "number", 0);

    /*
     * 속도를 나타낸다.
     */
    this.velocity = typeCheck(options.velocity, Vector, new Vector(0, 0));

    /*
     * 가속도를 나타낸다.
     */
    this.acceleration = typeCheck(
      options.acceleration,
      Vector,
      new Vector(0, 0)
    );

    /*
     * 물리적인 크기를 나타낸다.
     * GameObject를 상속받은 이미지나 도형들은
     * 이 값도 필수적으로 변경해야한다.
     */
    this.size = new Vector(0, 0);
  }

  /*
   * Transform의 좌표, 회전, 축척을 한 번에 나타낼 수 있게
   * matrix형태로 변환한다.
   * 변환한 matrix는 행렬곱을 통해 부모-자식간의 상대좌표를
   * 화면 상의 절대좌표로 변환할 수 있게 해준다.
   */
  toMatrix() {
    // 먼저 현재 좌표를 행렬에 저장한다.
    let matrix = new Matrix();
    matrix.x = this.position.x;
    matrix.y = this.position.y;

    // 회전변환을 한다.
    const rotateMatrix = new Matrix();
    const rad = (this.rotation * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    rotateMatrix.a = cos;
    rotateMatrix.b = sin;
    rotateMatrix.c = -sin;
    rotateMatrix.d = cos;
    matrix = matrix.multiply(rotateMatrix);

    // 크기변환을 한다.
    const scaleMatrix = new Matrix();
    scaleMatrix.a = this.scale.x;
    scaleMatrix.d = this.scale.y;
    matrix = matrix.multiply(scaleMatrix);

    return matrix;
  }

  copy() {
    const transform = new Transform({
      position: new Vector(this.position.x, this.position.y),
      scale: new Vector(this.scale.x, this.scale.y),
      rotation: this.rotation,
      velocity: new Vector(this.velocity.x, this.velocity.y),
      acceleration: new Vector(this.acceleration.x, this.acceleration.y),
    });

    transform.size = new Vector(this.size.x, this.size.y);

    return transform;
  }
}
