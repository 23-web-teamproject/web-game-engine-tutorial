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
     * 좌표값을 나타낸다.
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

    /*
     * 객체의 회전이나 축척을 변형할 때 기본적으로는
     * 객체의 좌상단을 기준으로 변형한다.
     * 특정 좌표를 기준으로 변형하려고 하면 이 값을 변경하면 된다.
     */
    this.pivotPosition = new Vector(0, 0);
  }

  /*
   * Transform의 좌표, 회전, 축척을 한 번에 나타낼 수 있게
   * matrix형태로 변환한다.
   * 변환한 matrix는 행렬곱을 통해 부모-자식간의 상대좌표를
   * 화면 상의 절대좌표로 변환할 수 있게 해준다.
   */
  toMatrix() {
    let matrix = new Matrix();
    matrix.x = this.position.x;
    matrix.y = this.position.y;

    // 먼저 회전변환과 크기변환을 할 때 중심이 되는 위치로 이동한다.
    const translateToPivotMatrix = new Matrix();
    translateToPivotMatrix.x = this.pivotPosition.x;
    translateToPivotMatrix.y = this.pivotPosition.y;
    matrix = matrix.multiply(translateToPivotMatrix);

    // 그다음 회전변환과 크기변환을 한다.
    const rotateMatrix = new Matrix();
    const rad = (this.rotation * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    rotateMatrix.a = cos;
    rotateMatrix.b = sin;
    rotateMatrix.c = -sin;
    rotateMatrix.d = cos;
    matrix = matrix.multiply(rotateMatrix);

    const scaleMatrix = new Matrix();
    scaleMatrix.a = this.scale.x;
    scaleMatrix.d = this.scale.y;
    matrix = matrix.multiply(scaleMatrix);

    // 모든 변환이 끝난 후 다시 원점으로 돌아온다.
    const translateToOriginMatrix = new Matrix();
    translateToOriginMatrix.x = -this.pivotPosition.x;
    translateToOriginMatrix.y = -this.pivotPosition.y;
    matrix = matrix.multiply(translateToOriginMatrix);

    return matrix;
  }

  /*
   * 회전이나 축척 변형의 기준좌표를 size의 절반으로 설정한다.
   * 이렇게 하면 GameObject의 가운데를 기준으로 회전하거나 스케일이 늘어난다.
   */
  setPivotPositionToCenter() {
    this.pivotPosition = this.size.multiply(0.5);
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
    transform.pivotPosition = new Vector(
      this.pivotPosition.x,
      this.pivotPosition.y
    );

    return transform;
  }
}
