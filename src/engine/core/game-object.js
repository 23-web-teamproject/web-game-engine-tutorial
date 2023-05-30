import Color from "/src/engine/data-structure/color.js";
import {
  DefaultLayer,
  Layer,
  TerrainLayer,
} from "/src/engine/data-structure/layer.js";
import Matrix from "/src/engine/data-structure/matrix.js";
import Transform from "/src/engine/data-structure/transform.js";
import RigidBody from "/src/engine/data-structure/rigidbody.js";
import Vector from "/src/engine/data-structure/vector.js";
import { BoxCollider } from "/src/engine/data-structure/collider.js";

import DestroyManager from "/src/engine/core/destroy-manager.js";
import InputManager from "/src/engine/core/input-manager.js";
import SceneManager from "/src/engine/core/scene-manager.js";
import RenderManager from "/src/engine/core/render-manager.js";

import { typeCheck } from "/src/engine/utils.js";

/**
 * 게임에 등장하는 모든 객체의 기본형태다.
 * 게임에 등장하는 모든 객체는 GameObject를 상속받아 구현된다.
 */
class GameObject {
  /**
   * @constructor
   * @param {object} [options]
   * @param {string} [options.name]
   * @param {boolean} [options.isActive]
   * @param {boolean} [options.isVisible]
   * @param {Layer} [options.layer]
   * @param {Color} [options.color=Random Color]
   * @param {boolean} [options.isPhysicsEnable=false]
   * @param {object} [options.transform]
   * @param {Vector} [options.transform.position=new Vector(0, 0)]
   * @param {Vector} [options.transform.scale=new Vector(1, 1)]
   * @param {number} [options.transform.rotation=0]
   * @param {object} [options.boundary]
   * @param {number} [options.boundary.width]
   * @param {number} [options.boundary.height]
   * @param {number} [options.boundary.offset]
   * @param {object} [options.rigidbody]
   * @param {number} [options.rigidbody.mass=1]
   * @param {number} [options.rigidbody.bounceness=0.5]
   * @param {number} [options.rigidbody.staticFriction=0.2]
   * @param {number} [options.rigidbody.dynamicFriction=0.1]
   * @param {boolean} [options.rigidbody.isStatic=false]
   * @param {boolean} [options.rigidbody.isGravity=false]
   * @param {boolean} [options.rigidbody.isTrigger=false]
   */
  constructor(options = {}) {
    /**
     * canvas에 이 객체를 렌더링할 때 사용할 context다.
     *
     * @type {CanvasRenderingContext2d}
     */
    this.context2d = RenderManager.getRenderCanvas().getContext("2d");
    /**
     * 생성된 객체의 이름을 말한다.
     * 기본값으로는 생성자의 이름을 저장한다.
     *
     * @type {string}
     */
    this.name = typeCheck(options.name, "string", this.constructor.name);
    /**
     * 화면에 이 객체를 그릴 것인지를 의미한다.
     * 기본값은 true다.
     *
     * @type {boolean}
     */
    this.isVisible = typeCheck(options.isVisible, "boolean", true);
    /**
     * 이 객체가 활성상태인지 의미한다.
     * 만약 이 값이 false라면 update와 render가 실행되지 않는다.
     * 이 값이 false라면 물리엔진에서도 수집하지 않는다.
     * 기본값은 true다.
     *
     * @type {boolean}
     */
    this.isActive = typeCheck(options.isActive, "boolean", true);
    /**
     * 객체의 레이어다.
     *
     * @type {Layer}
     */
    this.layer = typeCheck(options.layer, Layer, new DefaultLayer());
    /**
     * 물리효과를 위한 강체다.
     *
     * @type {RigidBody}
     */
    this.rigidbody = new RigidBody(options.rigidbody);

    if (this.rigidbody.isStatic) {
      this.rigidbody.inverseMass = 0;
    }
    /**
     * 이 객체의 좌표, 크기, 각도 등을 의미한다.
     *
     * @type {Transform}
     */
    this.transform = new Transform(options.transform);

    /**
     * 이 객체에 물리효과를 적용할건지를 의미한다.
     * 기본적으론 적용하지 않는다.
     *
     * @type {boolean}
     */
    this.isPhysicsEnable = typeCheck(options.isPhysicsEnable, "boolean", false);

    /**
     * 이 객체의 Collision 타입을 나타낸다.
     * 기본값으로는 상자 형태(BoxCollider)를 사용한다.
     *
     * @type {BoxCollider}
     */
    this.collider = new BoxCollider(options.boundary);
    /**
     * 렌더링에 사용될 색상값이다.
     *
     * @type {Color}
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
    /**
     * 이 객체의 transform을 행렬로 나타낸 결과다.
     * canvas에서 좌표, 회전, 규모를 이용해 물체를 그리려면 행렬을 이용해야한다.
     * 그래서 이 객체의 transform을 canvas에서 활용할 수 있게
     * matrix로 변환하여 저장한다.
     *
     * @type {Matrix}
     */
    this.localMatrix = this.transform.toMatrix();
    /**
     * 부모의 matrix와 이 객체의 matrix를 행렬곱해 얻은 값이다.
     * 이 matrix를 이용해 화면에 렌더링하게 된다.
     *
     * @type {Matrix}
     */
    this.matrix = this.localMatrix;
    /**
     * 이 객체의 자식들을 저장할 테이블이다.
     *
     * @type {array}
     */
    this.childList = new Array();
    /**
     * 이 객체의 부모 객체다.
     * 부모의 matrix를 이용해 자신의 matrix를 만들고,
     * 이 객체를 삭제할 때 부모에 의해 삭제되기 때문에
     * 이 객체의 부모를 기억해야 한다.
     *
     * @type {GameObject}
     */
    this.parent = undefined;
  }

  /**
   * GameObject 내에서는 단순히 이 오브젝트에 등록된
   * 하위 GameObject들의 update를 실행시킨다.
   *
   * @param {number} deltaTime - 이전 프레임과 현재 프레임의 시간차
   */
  update(deltaTime) {
    if (this.isActive) {
      this.childList.forEach((child) => {
        child.update(deltaTime);
      });
    }
  }

  /**
   * 가속도를 적분하여 속도에 누적한다.
   *
   * @param {number} deltaTime - 이전 프레임과 현재 프레임의 시간차
   */
  integrateForce(deltaTime) {
    // inverseMass가 0이라는 말은 static 객체임을 말한다.
    if (this.getInverseMass() === 0) {
      return;
    }

    // rigidbody의 isGravity가 참일 때에만 중력가속도를 적용한다.
    const acceleration = new Vector(0, 0);
    if (this.rigidbody.isGravity) {
      acceleration.y += 9.8;
    }
    this.setAcceleration(acceleration);

    this.addVelocity(this.getAcceleration().multiply(deltaTime));
  }

  /**
   * 속도를 적분하여 좌표값에 누적한다.
   *
   * @param {number} deltaTime - 이전 프레임과 현재 프레임의 시간차
   */
  integrateVelocity(deltaTime) {
    // inverseMass가 0이라는 말은 static 객체임을 말한다.
    if (this.getInverseMass() === 0) {
      return;
    }
    this.addPosition(this.getVelocity().multiply(deltaTime));
    // 변한 좌표값이 matrix에는 저장되지 않으므로
    // 어쩔 수 없이 matrix로 바꾸는 연산을 수행한다.
    this.calculateMatrix();
  }

  /**
   * 화면에 렌더링될 객체의 matrix를 계산한다.
   * 이 때 부모 객체가 있다면 행렬곱을 수행해 두 matrix를 결합한다.
   * 이 객체의 자식들의 matrix도 업데이트한다.
   */
  updateMatrix() {
    if (this.isActive) {
      this.calculateMatrix();

      this.childList.forEach((child) => {
        child.updateMatrix();
      });
    }
  }

  calculateMatrix() {
    this.updateLocalMatrix();

    if (this.hasParentGameObject()) {
      this.multiplyParentMatrix();
    } else {
      this.matrix = this.localMatrix;
    }
  }

  updateLocalMatrix() {
    this.localMatrix = this.transform.toMatrix();
  }

  /**
   * 이 객체의 부모가 존재한다면 true를 반환한다.
   *
   * @returns {boolean}
   */
  hasParentGameObject() {
    return this.parent !== undefined;
  }

  /**
   * 자신의 transform을 matrix로 변환한 것과 부모의 matrix를 행렬곱한다.
   */
  multiplyParentMatrix() {
    const parentMatrix = this.parent.getMatrix();
    this.matrix = parentMatrix.multiply(this.localMatrix);
  }

  /**
   * beforeDraw로 전처리 과정을 거친 후,
   * draw()를 통해 객체마다 정의된 방법으로 객체를 렌더링한다.
   * 이 객체를 상속받은 Rect나 Circle처럼 자식객체에 따라
   * 각각 다른 렌더링이 수행된다.
   * 그 후 이 객체의 모든 자식들을 렌더링한다.
   * 모든 렌더링이 끝나면 afterDraw로 전처리를 해제한다.
   */
  render() {
    if (this.isActive && this.isVisible) {
      this.beforeDraw();

      this.setTransform();

      this.draw();

      this.childList.forEach((child) => {
        child.render();
      });

      this.afterDraw();
    }
  }

  /**
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

  /**
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

  /**
   * 이 함수는 GameObject를 상속받은 객체마다 다르게 동작한다.
   * GameObject 자체는 렌더링할 대상이 없지만 Sprite나, Rect, Text 등
   * GmaeObject를 상속받은 객체들은 명확히 렌더링할 대상이 존재한다.
   * 그 때 이 함수안에서 어떻게 렌더링할건지 정의를 해 놓으면 된다.
   * super.render()를 먼저 호출하고 대상을 렌더링할 경우
   * 이미 렌더링된 자식 오브젝트를 덮어씌워 렌더링할 수 있으므로
   * 렌더링만큼은 draw 함수 내에서만 정의를 하는게 좋다.
   */
  draw() {}

  /**
   * 일반적으로 beforeDraw()에서 전처리했던 것을 원래대로 돌리는 작업을 한다.
   * beforeDraw()를 오버라이드했다면 이 함수도 오버라이드하여
   * 수정된 context2d를 원래대로 돌려놓아야 한다.
   */
  afterDraw() {
    this.context2d.restore();
  }

  /**
   * 이 객체의 이름을 반환한다.
   *
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * 이 객체의 이름을 설정한다.
   * 기본값으로는 생성자의 이름을 저장하게 된다.
   *
   * @param {string} name - 객체의 이름
   */
  setName(name) {
    this.name = typeCheck(name, "string", this.constructor.name);
  }

  /**
   * isActive를 true로 설정한다.
   */
  activate() {
    this.isActive = true;
  }

  /**
   * isActive를 false로 설정한다.
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * isVisible을 true로 설정한다.
   */
  show() {
    this.isVisible = true;
  }

  /**
   * isVisible을 false로 설정한다.
   */
  hide() {
    this.isVisible = false;
  }

  /**
   * 레이어를 반환한다.
   *
   * @return {Layer}
   */
  getLayer() {
    return this.layer;
  }

  /**
   * 인자로 받은 객체와 이 객체 사이에 부모-자식 관계를 만든다.
   * 만약 이 객체의 부모가 이미 있다면, 그 부모의 자식 테이블에서 이 객체를
   * 제거하고, 새로운 부모의 자식 테이블에 이 객체를 추가한다.
   *
   * @param {GameObject} parent - 이 객체의 부모가 될 객체
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

  /**
   * 인자로 전달받은 객체가 자식 테이블에 존재한다면,
   * 그 객체를 자식 테이블에서 제거하고,
   * 씬 객체의 자식 테이블에 추가한다.
   *
   * @param {GameObject} child - 자식 리스트에서 지워질 자식 객체
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

  /**
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

  /**
   * 자식 목록에 인자로 전달된 객체를 추가한다.
   *
   * @param {GameObject} child - 이 객체의 자식으로 추가될 객체
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

  /**
   * 이 객체가 물리효과에 의해 다른 객체와 충돌했을 때
   * 이 함수가 호출된다.
   *
   * @param {GameObject} other - 이 객체와 충돌한 다른 객체
   */
  onCollision(other) {}

  /**
   * 월드 좌표계에서 이 객체의 좌표값을 특정값만큼 더한다.
   * 인자로 받은 좌표가 로컬 좌표계에서는 얼마나 이동시키게 되는지
   * 행렬연산을 통해 구한후 로컬 좌표계에 더함으로 이 객체를 이동시킨다.
   *
   * @param {Vector} position - 월드좌표계에서 이 객체의 좌표값에 더해질 좌표값
   */
  addPosition(position) {
    if (this.hasParentGameObject()) {
      // 월드 좌표계에서 이 객체의 위치를 이동시킨다.
      this.matrix.x += position.x;
      this.matrix.y += position.y;

      // 월드 좌표계에서 이동한 좌표는 로컬 좌표계에서
      // 어느 위치인지 역행렬을 통해 구한다.
      // 부모 * 로컬 = 월드
      // 로컬 = 부모^-1 * 월드
      const inverseOfParentMatrix = this.parent.getMatrix().inverse();
      const result = inverseOfParentMatrix.multiply(this.matrix);

      // 구한 값을 로컬 좌표계 및 transform의 position에 대입한다.
      this.transform.position = new Vector(result.x, result.y);
      this.localMatrix.x = result.x;
      this.localMatrix.y = result.y;
    } else {
      // 부모가 없는 경우 (로컬 좌표계 === 월드 좌표계)이므로
      // 좌표값을 바로 더한다.
      this.addLocalPosition(position);
    }
  }

  /**
   * 로컬 좌표계에서 이 객체의 좌표값에 특정값을 더한다.
   * 로컬 좌표값을 변경한 후에는 항상 로컬 matrix도 갱신한다.
   *
   * @param {Vector} position - 로컬 좌표계에서 이 객체의 위치에 더해질 좌표값
   */
  addLocalPosition(position) {
    this.transform.position = this.transform.position.add(position);
    this.updateLocalMatrix();
  }

  /**
   * 월드 좌표계에서 이 객체의 좌표를 특정값으로 설정한다.
   * 인자로 받은 좌표가 로컬 좌표계에서는 얼마나 떨어진 거리인지
   * 행렬연산을 통해 구한 후 로컬 좌표계에서 이 객체의 좌표를
   * 특정값으로 설정한다.
   *
   * @param {Vector} position - 월드 좌표계에서 이 객체의 자표로 설정될 좌표값
   */
  setPosition(position) {
    if (this.hasParentGameObject()) {
      // 월드 좌표계에서 이 객체의 위치를 설정한다.
      this.matrix.x = position.x;
      this.matrix.y = position.y;

      // 월드 좌표계에서 설정한 좌표는 로컬 좌표계에서
      // 어느 위치인지 역행렬을 통해 구한다.
      // 부모 * 로컬 = 월드
      // 로컬 = 부모^-1 * 월드
      const inverseOfParentMatrix = this.parent.getMatrix().inverse();
      const result = inverseOfParentMatrix.multiply(this.matrix);

      // 구한 값을 로컬 좌표계 및 transform의 position에 대입한다.
      this.transform.position = new Vector(result.x, result.y);
      this.localMatrix.x = result.x;
      this.localMatrix.y = result.y;
    } else {
      // 부모가 없는 경우 (로컬 좌표계 === 월드 좌표계)이므로
      // 좌표값을 바로 대입한다.
      this.setLocalPosition(position);
    }
  }

  /**
   * 이 객체의 로컬 좌표값을 특정값으로 설정한다.
   * 로컬 좌표값을 변경한 후에는 항상 로컬 matrix도 갱신한다.
   *
   * @param {Vector} position - 로컬 좌표계에서 이 객체의 좌표로 설정될 좌표값
   */
  setLocalPosition(position) {
    this.transform.position = position;
    this.updateLocalMatrix();
  }

  /**
   * 로컬 좌표계에서 이 객체의 좌표값을 반환한다.
   *
   * @returns {Vector}
   */
  getLocalPosition() {
    return this.transform.position;
  }

  /**
   * 월드 좌표계에서 이 객체의 좌표값을 반환한다.
   *
   * @returns {Vector}
   */
  getPosition() {
    return new Vector(this.matrix.x, this.matrix.y);
  }

  /**
   * 로컬 좌표계의 크기를 특정값만큼 변경한다.
   *
   * @param {Vector} scale - 변경할 로컬 좌표계의 크기
   */
  addLocalScale(scale) {
    this.transform.scale = this.transform.scale.add(scale);
  }

  /**
   * 로컬 좌표계의 크기를 특정값으로 변경한다.
   *
   * @param {Vector} scale - 이 객체의 규모로 설정될 규모값
   */
  setLocalScale(scale) {
    this.transform.scale = scale;
  }

  /**
   * 로컬 좌표계의 크기를 반환한다.
   *
   * @returns {Vector}
   */
  getLocalScale() {
    return this.transform.scale;
  }

  /**
   * 이 객체의 matrix에서 scale을 추출해 반환한다.
   * 월드 좌표계에서 이 객체의 크기를 구하기 위해 사용한다.
   *
   * @returns {Vector}
   */
  getWorldScale() {
    const rad = (this.getWorldRotation() * Math.PI) / 180;

    const x =
      rad != 0 ? this.matrix.b / Math.sin(rad) : this.matrix.a / Math.cos(rad);
    const y =
      rad != 0 ? -this.matrix.c / Math.sin(rad) : this.matrix.d / Math.cos(rad);
    return new Vector(x, y);
  }

  /**
   * 로컬 좌표계에서 이 객체의 각도(degree)를 특정값만큼 변경한다.
   *
   * @param {number} degree - 이 객체의 각도에 더해질 각도값(degree)
   */
  addLocalRotation(degree) {
    this.transform.rotation += degree;
    this.transform.rotation = this.transform.rotation % 360;
  }

  /**
   * 로컬 좌표계에서 이 객체의 각도(degree)를 특정값으로 설정한다.
   *
   * @param {number} degree - 이 객체의 각도로 설정될 각도값(degree)
   */
  setLocalRotation(degree) {
    this.transform.rotation = degree;
  }

  /**
   * 로컬 좌표계에서 이 객체의 각도(degree)를 반환한다.
   *
   * @returns {number}
   */
  getLocalRotation() {
    return this.transform.rotation;
  }

  /**
   * 월드 좌표계에서 이 객체의 각도(degree)를 반환한다.
   *
   * @return {number}
   */
  getWorldRotation() {
    const a = this.matrix.a;
    const b = this.matrix.b;
    return (Math.atan2(b, a) * 180) / Math.PI;
  }

  /**
   * 이 객체의 속도를 특정값만큼 증가시킨다.
   *
   * @param {Vector} velocity - 이 객체의 속도에 더해질 속도값
   */
  addVelocity(velocity) {
    this.transform.velocity = this.transform.velocity.add(velocity);
  }

  /**
   * 이 객체의 속도를 특정값으로 설정한다.
   *
   * @param {Vector} velocity
   */
  setVelocity(velocity) {
    this.transform.velocity = velocity;
  }

  /**
   * 이 객체의 속도를 반환한다.
   *
   * @returns {Vector}
   */
  getVelocity() {
    return this.transform.velocity;
  }

  /**
   * 이 객체의 가속도를 특정값만큼 증가시킨다.
   *
   * @param {Vector} 이 객체의 가속도에 더해질 가속도값
   */
  addAcceleration(acceleration) {
    this.transform.acceleration = this.transform.acceleration.add(acceleration);
  }

  /**
   * 이 객체의 가속도를 특정값으로 설정한다.
   *
   * @param {Vector} accelration
   */
  setAcceleration(accelration) {
    this.transform.acceleration = accelration;
  }

  /**
   * 이 객체의 가속도를 반환한다.
   *
   * @returns {Vector}
   */
  getAcceleration() {
    return this.transform.acceleration;
  }

  /**
   * 월드 좌표계에서 이 객체의 물리적 크기를 반환한다.
   * 로컬 좌표계에서 이 객체의 크기를 구한 후,
   * 월드 좌표계의 scale에 곱한다.
   *
   * @returns {Vector}
   */
  getWorldSize() {
    return this.getSize().elementMultiply(this.getWorldScale());
  }

  /**
   * 이 객체의 size를 반환한다.
   *
   * @returns {Vector}
   */
  getSize() {
    return this.transform.size;
  }

  /**
   * 월드 좌표계에서 이 객체의 외형의 크기를 반환한다.
   * 기본적으로 BoxCollider를 사용하기 때문에 상자 형태의 크기가 반환된다.
   * 만약 GameObject를 상속받는 객체에서 다른 Collider를 사용한다면,
   * 이 함수를 재정의해야한다.
   *
   * @returns {Vector}
   */
  getBoundary() {
    return this.collider.getBoundary().elementMultiply(this.getWorldScale());
  }

  /**
   * 월드 좌표계에서 이 객체의 좌표값에 Collider의
   * 월드 좌표계에서의 오프셋값을 더한 좌표를 반환한다.
   *
   * @returns {Vector}
   */
  getColliderPosition() {
    return this.getPosition().add(this.getColliderOffset());
  }

  /**
   * 월드 좌표계에서 Collider의 오프셋을 반환한다.
   * 이 때 오프셋에 WorldScale을 적용한다.
   *
   * @returns {Vector}
   */
  getColliderOffset() {
    return this.collider.getOffset();
  }

  /**
   * 이 객체의 matrix를 반환한다.
   *
   * @returns {Matrix}
   */
  getMatrix() {
    return this.matrix;
  }

  /**
   * 이 객체의 탄성값을 반환한다.
   *
   * @returns {number}
   */
  getBounceness() {
    return this.rigidbody.bounceness;
  }

  /**
   * 이 객체의 정지 마찰 계수를 반환한다.
   *
   * @returns {number}
   */
  getStaticFriction() {
    return this.rigidbody.staticFriction;
  }

  /**
   * 이 객체의 운동 마찰 계수를 반환한다.
   *
   * @returns {number}
   */
  getDynamicFriction() {
    return this.rigidbody.dynamicFriction;
  }

  /**
   * 이 객체의 질량값을 반환한다.
   *
   * @returns {number}
   */
  getMass() {
    return this.rigidbody.mass;
  }

  /**
   * 이 객체의 질량값의 역수를 반환한다.
   *
   * @returns {number}
   */
  getInverseMass() {
    return this.rigidbody.inverseMass;
  }

  /**
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

  /**
   * 마우스 왼쪽 버튼으로 이 객체를 클릭했는지를 반환한다.
   *
   * @returns {boolean}
   */
  isLeftMouseClickThis() {
    return InputManager.isKeyDown("leftMouse") && this.isMouseOver();
  }

  /**
   * 마우스 오른쪽 버튼으로 이 객체를 클릭했는지를 반환한다.
   *
   * @returns {boolean}
   */
  isRightMouseClickThis() {
    return InputManager.isKeyDown("rightMouse") && this.isMouseOver();
  }

  /**
   * 월드 좌표계에서 이 객체 위에 마우스가 올라가 있는지를 반환한다.
   *
   * @returns {boolean}
   */
  isMouseOver() {
    const size = this.getWorldSize();
    const position = this.getPosition();
    const leftTop = position.minus(size.multiply(0.5));
    const rightBottom = position.add(size.multiply(0.5));
    const mousePos = InputManager.getMousePos();
    return (
      leftTop.x < mousePos.x &&
      mousePos.x < rightBottom.x &&
      leftTop.y < mousePos.y &&
      mousePos.y < rightBottom.y
    );
  }
}

export default GameObject;
