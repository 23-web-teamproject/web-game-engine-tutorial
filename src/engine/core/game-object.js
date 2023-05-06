/*
 * 게임에 등장하는 모든 객체의 기본형태는 GameObject다.
 * 그러므로 게임에 등장하는 모든 객체는 GameObject를 상속받아 구현된다.
 */
import Color from "/src/engine/data-structure/color.js";
import Matrix from "/src/engine/data-structure/matrix.js";
import Transform from "/src/engine/data-structure/transform.js";
import RigidBody from "/src/engine/data-structure/rigidbody.js";
import Vector from "/src/engine/data-structure/vector.js";
import { BoxCollider } from "/src/engine/data-structure/collider.js";

import DestroyManager from "/src/engine/core/destroy-manager.js";
import SceneManager from "/src/engine/core/scene-manager.js";
import RenderManager from "/src/engine/core/render-manager.js";

import { typeCheck } from "/src/engine/utils.js";

export default class GameObject {
  constructor(options = {}) {
    /*
     * canvas에 이 객체를 렌더링할 때 사용할 context다.
     */
    this.context2d = RenderManager.getRenderCanvas().getContext("2d");
    /*
     * 물리효과를 위한 강체다.
     */
    this.rigidbody = new RigidBody(options.rigidbody);
    /*
     * 이 객체의 좌표, 크기, 각도 등을 의미한다.
     */
    this.transform = new Transform(options.transform);

    if (this.rigidbody.isStatic) {
      this.rigidbody.inverseMass = 0;
    }
    if (this.rigidbody.isGravity) {
      this.transform.acceleration.y = 9.8;
    }
    /*
     * 이 객체에 물리효과를 적용할건지를 의미한다.
     * 기본적으론 적용하지 않는다.
     */
    this.isPhysicsEnable = typeCheck(options.isPhysicsEnable, "boolean", false);
    /*
     * 이 객체의 Collision 타입을 나타낸다.
     * 기본값으로는 상자 형태(BoxCollider)를 사용한다.
     */
    this.collider = new BoxCollider();
    /*
     * 렌더링에 사용될 색상값이다.
     */
    this.color = typeCheck(
      options.color,
      Color,
      new Color(
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        1
      )
    );
    /*
     * 이 객체의 transform을 행렬로 나타낸 결과다.
     * canvas에서 좌표, 회전, 크기를 이용해 물체를 그리려면 행렬을 이용해야한다.
     * 그래서 이 객체의 transform을 canvas에서 활용할 수 있게 matrix로 변환해야하고
     * 그 결과가 matrix에 저장된다.
     */
    this.matrix = this.transform.toMatrix();
    /*
     * 이전 프레임의 matrix와 현재 프레임의 matrix를 선형보간하기 위해
     * 이전 프레임의 matrix를 저장해야한다.
     */
    this.previousMatrix = this.transform.toMatrix();
    /*
     * 이 객체의 자식들을 저장할 테이블이다.
     */
    this.childList = new Array();
    /*
     * 이 객체의 부모 객체다.
     * 부모의 matrix를 이용해 자신의 matrix를 만들고,
     * 이 객체를 삭제할 때 부모에 의해 삭제되기 때문에
     * 이 객체의 부모를 기억해야 한다.
     */
    this.parent = undefined;
  }

  /*
   * GameObject 내에서는 단순히 이 오브젝트에 등록된
   * 하위 GameObject들의 update를 실행시킨다.
   */
  update(deltaTime) {
    this.childList.forEach((child) => {
      child.update(deltaTime);
    });
  }

  /*
   * 가속도를 적분하여 속도에 누적한다.
   */
  integrateForce(deltaTime) {
    // inverseMass가 0이라는 말은 static 객체임을 말한다.
    if (this.getInverseMass() === 0) {
      return;
    }
    this.addVelocity(this.getAcceleration().multiply(deltaTime));
  }

  /*
   * 속도를 적분하여 좌표값에 누적한다.
   */
  integrateVelocity(deltaTime) {
    // inverseMass가 0이라는 말은 static 객체임을 말한다.
    if (this.getInverseMass() === 0) {
      return;
    }
    this.addPosition(this.getVelocity().multiply(deltaTime));
    // 변한 좌표값이 matrix에는 저장되지 않으므로
    // 어쩔 수 없이 matrix로 바꾸는 연산을 수행한다.
    if (this.hasParentGameObject()) {
      this.multiplyParentMatrix();
    } else {
      this.matrix = this.transform.toMatrix();
    }
  }

  /*
   * transform을 matrix로 변환한다.
   * 이 때 부모 객체가 있다면 행렬곱을 수행해 두 matrix를 결합한다.
   */
  calculateMatrix() {
    if (this.hasParentGameObject()) {
      this.multiplyParentMatrix();
    } else {
      this.matrix = this.transform.toMatrix();
    }

    this.childList.forEach((child) => {
      child.calculateMatrix();
    });
  }

  /*
   * 먼저 선형보간한 matrix를 사용해 context에 등록한다.
   * 그 다음 draw()를 통해 물체를 렌더링한다.
   * 이 객체를 상속받은 Rect나 Circle처럼 자식객체에 따라 
   * 각각 다른 렌더링이 수행된다.
   * 그 후 이 객체의 모든 자식들을 렌더링한다.
   */
  render(alpha) {
    this.beforeDraw();

    this.interpolateMatrixWithPreviousMatrix(alpha);
    this.setTransform();

    this.draw();

    this.childList.forEach((child) => {
      child.render(alpha);
    });

    this.afterDraw();
  }

  /*
   * 이전 프레임의 matrix와 이후 프레임의 matrix을
   * 선형보간한 matrix를 만든다.
   */
  interpolateMatrixWithPreviousMatrix(alpha) {
    const interpolatedMatrix = new Matrix();
    interpolatedMatrix.a =
      this.previousMatrix.a * alpha + this.matrix.a * (1 - alpha);
    interpolatedMatrix.b =
      this.previousMatrix.b * alpha + this.matrix.b * (1 - alpha);
    interpolatedMatrix.x =
      this.previousMatrix.x * alpha + this.matrix.x * (1 - alpha);
    interpolatedMatrix.c =
      this.previousMatrix.c * alpha + this.matrix.c * (1 - alpha);
    interpolatedMatrix.d =
      this.previousMatrix.d * alpha + this.matrix.d * (1 - alpha);
    interpolatedMatrix.y =
      this.previousMatrix.y * alpha + this.matrix.y * (1 - alpha);

    this.previousMatrix = this.matrix;
    this.matrix = interpolatedMatrix;
  }

  /*
   * 이 객체의 부모가 존재하는지 확인한다.
   */
  hasParentGameObject() {
    return this.parent !== undefined;
  }

  /*
   * 자신의 transform을 matrix로 변환한 것과 부모의 matrix를 행렬곱한다.
   */
  multiplyParentMatrix() {
    const parentMatrix = this.parent.getMatrix();
    this.matrix = parentMatrix.multiply(this.transform.toMatrix());
  }

  /*
   * 계산된 matrix를 context2d에 적용한다.
   */
  setTransform() {
    this.context2d.setTransform(
      this.matrix.a,
      this.matrix.b,
      this.matrix.c,
      this.matrix.d,
      this.matrix.x,
      this.matrix.y
    );
  }

  /*
   * 렌더링 전에 색상값을 갱신한다거나 다른 작업이 미리 처리되어야 하는 경우
   * 이 함수를 오버라이드해서 사용하면 된다.
   *
   * 이 객체에서는 기본적으로 색상값을 적용시키기 위해 globalAlpha값을 조절한다.
   * context2d.save()를 통해 현재 설정값을 저장해두었으므로,
   * 마음대로 변경 후 context2d.restore()로 되돌리게 된다.
   * 따라서 현재 설정값이 자식들의 렌더링에 사용된다.
   */
  beforeDraw() {
    this.context2d.save();
    this.context2d.globalAlpha *= this.color.a;
  }

  /*
   * 이 함수는 GameObject를 상속받은 객체마다 다르게 동작한다.
   * GameObject 자체는 렌더링할 대상이 없지만 Sprite나, Rect, Text 등
   * GmaeObject를 상속받은 객체들은 명확히 렌더링할 대상이 존재한다.
   * 그 때 이 함수안에서 어떻게 렌더링할건지 정의를 해 놓으면 된다.
   * super.render()를 먼저 호출하고 대상을 렌더링할 경우
   * 이미 렌더링된 자식 오브젝트를 덮어씌워 렌더링할 수 있으므로
   * 렌더링만큼은 draw 함수 내에서만 정의를 하는게 좋다.
   */
  draw() {}

  /*
   * 일반적으로 beforeDraw()에서 전처리했던 것을 원래대로 돌리는 작업을 한다.
   * beforeDraw()를 오버라이드했다면 이 함수도 오버라이드하여
   * 수정된 context2d를 원래대로 돌려놓아야 한다.
   */
  afterDraw() {
    this.context2d.restore();
  }

  /*
   * 인자로 받은 객체와 이 객체 사이에 부모-자식 관계를 만든다.
   * 만약 이 객체의 부모가 이미 있다면, 그 부모의 자식 테이블에서 이 객체를
   * 제거하고, 새로운 부모의 자식 테이블에 이 객체를 추가한다.
   */
  setParent(parent) {
    // 이 객체의 부모 객체가 있다면
    // 부모 객체로부터 자식 객체를 제거한다.
    if (this.parent !== undefined) {
      const index = this.parent.childList.indexOf(this);
      this.parent.childList.splice(index, 1);
    }

    this.parent = parent;
    this.parent.addChild(this);
  }

  /*
   * 인자로 전달받은 객체가 자식 테이블에 존재한다면,
   * 그 객체를 자식 테이블에서 제거하고,
   * 씬 객체의 자식 테이블에 추가한다.
   */
  removeChild(child) {
    const index = this.childList.indexOf(child);
    const isChildExist = index !== -1;
    if (isChildExist) {
      this.childList.splice(index, 1);

      // 자식 객체의 부모를 씬 객체로 변경한다.
      SceneManager.getCurrentScene().addChild(child);
    }
  }

  /*
   * 이 객체의 부모와 이 객체 사이의 관계를 끊는다.
   * 이 객체는 부모로부터 떨어져 나오게 되는데,
   * 씬 객체를 새로운 부모로 설정한다.
   */
  removeParent() {
    // 만약 이 객체의 부모가 있어야지만 부모 객체로부터 떨어져 나올 수 있다.
    if (this.parent !== undefined) {
      // 부모 객체에게 자식을 삭제하라는 명령으로
      // 자식 객체의 부모를 삭제하는 것과
      // 부모 객체의 자식 목록에서 자식 객체를 삭제하라는 것을 해결할 수 있다.
      this.parent.removeChild(this);
    }
  }

  /*
   * 자식 목록에 인자로 전달된 객체를 추가한다.
   */
  addChild(child) {
    // 만약 이미 있는 자식 객체라면 추가하지 않는다.
    const index = this.childList.indexOf(child);
    if (index !== -1) {
      return;
    }
    this.childList.push(child);
    child.setParent(this);
  }

  /*
   * 이 객체가 물리효과에 의해 다른 객체와 충돌했을 때
   * 이 함수가 호출된다.
   */
  onCollision(other) {}

  /*
   * 이 객체의 좌표값에 특정값을 더한다.
   */
  addPosition(position) {
    this.transform.position = this.transform.position.add(position);
  }

  /*
   * 이 객체의 좌표값을 특정값으로 설정한다.
   */
  setPosition(position) {
    this.transform.position = position;
  }

  /*
   * 이 객체의 좌표값을 반환한다.
   */
  getPosition() {
    return this.transform.position;
  }

  /*
   * 이 객체의 화면상 좌표값을 반환한다.
   * Canvas에 이 객체를 렌더링할 때 사용하는 matrix에서
   * x, y값을 벡터로 만들어 반환한다.
   */
  getWorldPosition() {
    return new Vector(this.matrix.x, this.matrix.y);
  }

  /*
   * 이 객체의 크기를 특정값만큼 변경한다.
   */
  addScale(scale) {
    this.transform.scale = this.transform.scale.add(scale);
  }

  /*
   * 이 객체의 크기를 특정값으로 설정한다.
   */
  setScale(scale) {
    this.transform.scale = scale;
  }

  /*
   * 이 객체의 규모(스케일값)를 반환한다.
   * 크기(size)를 반환하는게 아니다!
   */
  getScale() {
    return this.transform.scale;
  }

  /*
   * 이 객체의 화면상 규모를 반환한다.
   */
  getWorldScale() {
    const rad = (this.getWorldRotation() * Math.PI) / 180;

    const x =
      rad != 0 ? this.matrix.b / Math.sin(rad) : this.matrix.a / Math.cos(rad);
    const y =
      rad != 0 ? -this.matrix.c / Math.sin(rad) : this.matrix.d / Math.cos(rad);
    return new Vector(x, y);
  }

  /*
   * 이 객체의 각도(degree)를 특정값만큼 변경한다.
   */
  addRotation(degree) {
    this.transform.rotation += degree;
  }

  /*
   * 이 객체의 각도(degree)를 특정값으로 설정한다.
   */
  setRotation(degree) {
    this.transform.rotation = degree;
  }

  /*
   * 이 객체의 각도(degree)를 반환한다.
   */
  getRotation() {
    return this.transform.rotation;
  }

  /*
   * 이 객체의 화면상 각도(degree)를 반환한다.
   */
  getWorldRotation() {
    const a = this.matrix.a;
    const b = this.matrix.b;
    return (Math.atan2(b, a) * 180) / Math.PI;
  }

  /*
   * 이 객체의 속도를 특정값만큼 증가시킨다.
   */
  addVelocity(velocity) {
    this.transform.velocity = this.transform.velocity.add(velocity);
  }

  /*
   * 이 객체의 속도를 반환한다.
   */
  getVelocity() {
    return this.transform.velocity;
  }

  /*
   * 이 객체의 가속도를 특정값만큼 증가시킨다.
   */
  addAcceleration(acceleration) {
    this.transform.acceleration = this.transform.acceleration.add(acceleration);
  }

  /*
   * 이 객체의 가속도를 반환한다.
   */
  getAcceleration() {
    return this.transform.acceleration;
  }

  /*
   * 이 객체의 크기를 반환한다.
   */
  getSize() {
    return this.transform.size;
  }

  /*
   * 이 객체의 화면상 크기를 반환한다.
   * 이 객체의 크기에 화면상 규모를 곱한 값을 반환하게 된다.
   */
  getWorldSize() {
    return this.getSize().elementMultiply(this.getWorldScale());
  }

  /*
   * 이 객체의 matrix를 반환한다.
   */
  getMatrix() {
    return this.matrix;
  }

  /*
   * 이 객체의 탄성값을 반환한다.
   */
  getBounceness() {
    return this.rigidbody.bounceness;
  }

  /*
   * 이 객체의 정지 마찰 계수를 반환한다.
   */
  getStaticFriction() {
    return this.rigidbody.staticFriction;
  }

  /*
   * 이 객체의 운동 마찰 계수를 반환한다.
   */
  getDynamicFriction() {
    return this.rigidbody.dynamicFriction;
  }

  /*
   * 이 객체의 질량값을 반환한다.
   */
  getMass() {
    return this.rigidbody.mass;
  }

  /*
   * 이 객체의 질량값의 역수를 반환한다.
   */
  getInverseMass() {
    return this.rigidbody.inverseMass;
  }

  /*
   * 이 객체를 씬으로부터 제거한다.
   * 이 객체의 자식 테이블에 있는 모든 객체들도 연달아 제거된다.
   * 
   * 이 객체를 제거하기위해 DestroyManager에 등록한다.
   * 이 객체가 등록되었다면 업데이트가 끝난 직후
   * DestroyManager가 등록된 객체들을 제거한다.
   */
  destroy() {
    DestroyManager.push(this);

    this.childList.forEach((child) => {
      child.destroy();
    });
  }
}
