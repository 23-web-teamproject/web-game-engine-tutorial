import Vector from "/src/engine/data-structure/vector.js";
import Matrix from "/src/engine/data-structure/matrix.js";

export default class Transform {
  constructor() {
    this.position = new Vector(0, 0);
    this.scale = new Vector(1, 1);
    this.rotation = 0; // degree

    this.size = new Vector(0, 0);
    this.pivotPosition = new Vector(0, 0);
  }

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

  setPivotPositionToCenter() {
    this.pivotPosition.x = this.size.x / 2;
    this.pivotPosition.y = this.size.y / 2;
  }
}
