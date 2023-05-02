import Color from "/src/engine/data-structure/color.js";
import Vector from "/src/engine/data-structure/vector.js";
import Transform from "/src/engine/data-structure/transform.js";
import RigidBody from "/src/engine/data-structure/rigidbody.js";
import { BoxCollider } from "/src/engine/data-structure/collider.js";
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
     * 물리효과를 위한 강체를 의미한다.
     */
    this.rigidbody = new RigidBody(options.rigidbody);

    /*
     * 이 객체의 좌표, 크기, 각도 등을 담고 있다.
     */
    this.transform = new Transform(options.transform);
    this.previousTransform = new Transform(options.transform);

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
     * 기본값으로는 상자형태를 사용한다.
     */
    this.collider = new BoxCollider(0, 0);

    /*
     * 렌더링에 사용될 색상값을 담고 있다.
     */
    this.color = typeCheck(options.color, Color, new Color(255, 255, 255, 1));

    /*
     * 객체의 자식들을 저장할 테이블이다.
     */
    this.childTable = new Object();

    /*
     * 객체의 부모를 기억한다.
     * 부모의 matrix를 이용해 자신을 렌더링하기 때문에 기억해야 한다.
     */
    this.parent = undefined;

    /*
     * 부모 matrix를 행렬곱한 결과를 담아 렌더링에 사용할 때 필요하다.
     * 부모 matrix를 행렬곱하여 이 객체의 matrix를 만들 때,
     * 이전 프레임의 transform과 현재 프레임의 transform을 선형보간하여
     * 새로운 transform을 만들고, 그 transform을 matrix로 바꾸어 적용한다.
     */
    this.matrix = this.transform.toMatrix();
  }

  /*
   * GameObject 내에서는 단순히 이 오브젝트에 등록된
   * 하위 GameObject들의 update를 실행시킨다.
   */
  update(deltaTime) {
    for (const child of Object.values(this.childTable)) {
      child.update(deltaTime);
    }
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

    for (const child of Object.values(this.childTable)) {
      child.calculateMatrix();
    }
  }

  /*
   * 이 GameObject의 하위 GameObject들의 render를 실행시킨다.
   * 부모의 matrix를 가져와 자신의 matrix와 행렬곱을 수행한다.
   * 그 결과를 이용해 렌더링에 사용하고,
   * 연결된 자식들의 렌더링을 수행하는데에 사용한다.
   */
  render(alpha) {
    this.beforeDraw();

    this.setTransform();

    this.draw();

    for (const child of Object.values(this.childTable)) {
      child.render(alpha);
    }

    this.afterDraw();
  }

  /*
   * 이전 프레임의 transform과 이후 프레임의 transform의
   * position, scale, rotation값을 선형보간한 matrix를 만든다.
   */
  createMatrixWithInterpolatedTransform(alpha) {
    const interpolatedTransform = new Transform({
      position: this.previousTransform.position
        .multiply(alpha)
        .add(this.transform.position.multiply(1 - alpha)),
      scale: this.previousTransform.scale
        .multiply(alpha)
        .add(this.transform.scale.multiply(1 - alpha)),
      rotation:
        this.previousTransform.rotation * alpha +
        this.transform.rotation * (1 - alpha),
    });

    interpolatedTransform.size = this.transform.size;

    this.previousTransform = this.transform.copy();
    this.matrix = interpolatedTransform.toMatrix();
  }

  /*
   * 객체의 부모가 존재하는지 확인한다.
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
   * GameObject 자체는 렌더링할 대상이 없지만 스프라이트나 도형, 텍스트 등
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
      const childName = this.parent.getChildNameByChildGameObj(this);
      delete this.parent.childTable[childName];
    }

    this.parent = parent;
    this.parent.addChild(this);
  }

  /*
   * 이 객체의 부모와 이 객체 사이의 관계를 끊는다.
   * 이 객체는 부모로부터 떨어져 나오게 되는데,
   * 이 때 씬 객체를 새로운 부모로 설정한다.
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
   * 인자로 전달받은 객체가 자식 테이블에 존재한다면,
   * 그 객체를 자식 테이블에서 제거하고,
   * 씬 객체의 자식 테이블에 추가한다.
   */
  removeChild(child) {
    const childName = this.getChildNameByChildGameObj(child);
    const isChildExist = this.childTable[childName];
    if (isChildExist) {
      delete this.childTable[childName];

      // 자식 객체의 부모를 씬 객체로 변경한다.
      SceneManager.getCurrentScene().addChild(child);
    }
  }

  /*
   * 자식 목록에 객체를 추가한다.
   * 일반적으로 자식 객체에 대한 key를 무조건 갖고 있어야 한다.
   * key를 따로 지정해주지 않았으므로 겹치지 않도록
   * 현재 시간에 해시 함수를 적용해 얻은 값을 key로 사용한다.
   * TODO
   * 해시 함수를 사용하면 충돌될 경우를 따로 처리해야한다.
   */
  addChild(child) {
    const childName = this.getChildNameByChildGameObj(child);
    // 만약 이미 있는 자식 객체라면 추가하지 않음.
    if (childName === undefined) {
      // 인자로 전달받은 객체를 자식 목록에 추가한다.

      const djb2 = (string) => {
        const TABLE_SIZE = 100000009;
        let hash = 5381,
          i = 0;
        while (i < string.length) {
          hash = ((hash << 5) + hash + string.charCodeAt(i++)) % TABLE_SIZE;
        }
        return hash;
      };

      const hash = djb2(new Date().getTime().toString());

      this.createChild(hash, child);
    }
  }

  /*
   * 인자로 주어진 childName을 key로 하고,
   * 객체의 자식 테이블에 gameObject를 자식 객체로 추가한다.
   */
  createChild(childName, gameObject) {
    if (childName in Object.keys(this.childTable) == false) {
      this.childTable[childName] = gameObject;
      gameObject.setParent(this);
    }
  }

  /*
   * 이 객체의 자식 테이블에 인자로 전달받은 객체가 자식으로 존재한다면
   * 그 객체의 key값(childName)을 반환한다.
   */
  getChildNameByChildGameObj(child) {
    return Object.keys(this.childTable).find(
      (key) => child === this.childTable[key]
    );
  }

  /*
   * 인자로 전달받은 childName을 key로 하여
   * 자식 테이블에 있는 자식 객체를 반환한다.
   */
  getChild(childName) {
    return this.childTable[childName];
  }

  /*
   * 이 객체가 물리효과에 의해 다른 객체와 충돌했을 때
   * 이 함수가 호출된다.
   */
  onCollision(other) {}

  /*
   * 이 객체의 좌표값을 특정값만큼 변경한다.
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
   * 이 객체의 크기(스케일값)를 반환한다.
   * 크기(size)를 반환하는게 아니다!
   */
  getScale() {
    return this.transform.scale;
  }

  getWorldScale() {
    const rad = (this.getWorldRotation() * Math.PI) / 180;

    const x =
      rad != 0 ? this.matrix.b / Math.sin(rad) : this.matrix.a / Math.cos(rad);
    const y =
      rad != 0 ? -this.matrix.c / Math.sin(rad) : this.matrix.d / Math.cos(rad);
    return new Vector(x, y);
  }

  /*
   * 이 객체의 각도를 특정값만큼 변경한다.
   */
  addRotation(degree) {
    this.transform.rotation += degree;
  }

  /*
   * 이 객체의 각도를 특정값으로 설정한다.
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

  getWorldRotation() {
    const a = this.matrix.a;
    const b = this.matrix.b;
    return (Math.atan2(b, a) * 180) / Math.PI;
  }

  /*
   * 이 객체의 속도를 증가시킨다.
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
   * 이 객체의 가속도를 증가시킨다.
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
   * 행렬곱된 matrix에서 이 객체의 화면상 크기를 반환한다.
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
   * 이 객체의 정지 마찰계수를 반환한다.
   */
  getStaticFriction() {
    return this.rigidbody.staticFriction;
  }

  /*
   * 이 객체의 운동 마찰계수를 반환한다.
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
   */
  destroy() {
    /* JS에는 클래스를 삭제하는 예약어가 따로 없다.
     * 단지 어떤 변수를 아무도 참조하지 않을 때 가비지 컬렉터(GC)가
     * 자동으로 수집해 제거한다.
     *
     * 그러므로 이 GameObject를 제거하기 위해서는 이 GameObject를
     * 아무도 참조하지 않으면 된다.
     * 따라서 부모가 이 GameObject를 참조하지 않도록 removeParent를 호출하고,
     * 이 GameObject의 자식객체들도 연쇄적으로 삭제하면 된다.
     */
    if (this.parent !== undefined) {
      // 부모의 자식 목록에서 이 객체를 삭제한다.
      const childName = this.parent.getChildNameByChildGameObj(this);
      delete this.parent.childTable[childName];
    }

    // 이 객체를 참조하는 자식 객체들도 삭제한다.
    for (const child of Object.values(this.childTable)) {
      child.destroy();
    }
  }
}
