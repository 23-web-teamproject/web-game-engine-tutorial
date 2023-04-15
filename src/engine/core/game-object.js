import Transform from "/src/engine/data-structure/transform.js";
import CanvasManager from "/src/engine/core/canvas-manager.js";
import SceneManager from "/src/engine/core/scene-manager.js";

export default class GameObject {
  constructor() {
    this.context2d = CanvasManager.getContext2D();

    this.transform = new Transform();
    this.transform.setPivotPositionToCenter();

    // 부모 matrix를 행렬곱한 결과를 담아 렌더링에 사용한다.
    this.matrix = undefined;
    this.childTable = new Object();
    this.parent = undefined;
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
   * 이 GameObject의 하위 GameObject들의 render를 실행시킨다.
   * 부모의 matrix를 가져와 자신의 matrix와 행렬곱을 수행한다.
   * 그 결과를 이용해 렌더링에 사용하고,
   * 연결된 자식들의 렌더링을 수행하는데에 사용한다.
   */
  render() {
    this.context2d.save();

    this.calculateMatrix();
    this.setTransform();
    this.draw();

    this.context2d.restore();

    for (const child of Object.values(this.childTable)) {
      child.render();
    }
  }

  /*
   * 현재 객체의 matrix를 계산할 때,
   * 만약 부모 객체가 존재하면 부모의 matrix와 자신의 matrix를 곱하고,
   * 부모 객체가 없다면 자신의 matrix만을 사용한다.
   */
  calculateMatrix() {
    if (this.isParentGameObjectExist()) {
      this.multiplyParentMatrix();
    } else {
      this.convertTransformToMatrix();
    }
  }

  isParentGameObjectExist() {
    return this.parent !== undefined;
  }

  multiplyParentMatrix() {
    const parentMatrix = this.parent.getMatrix();
    this.matrix = parentMatrix.multiply(this.transform.toMatrix());
  }

  convertTransformToMatrix() {
    this.matrix = this.transform.toMatrix();
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
   * 이 함수는 GameObject를 상속받은 객체마다 다르게 동작한다.
   * GameObject 자체는 렌더링할 대상이 없지만 스프라이트나 도형, 텍스트 등
   * GmaeObject를 상속받은 객체들은 명확히 렌더링할 대상이 존재한다.
   * 그 때 이 함수안에서 어떻게 렌더링할건지 정의를 해 놓으면 된다.
   * super.render()를 먼저 호출하고 대상을 렌더링할 경우
   * 이미 렌더링된 자식 오브젝트를 덮어씌워 렌더링할 수 있으므로
   * 렌더링만큼은 draw 함수 내에서만 정의를 하는게 좋다.
   */
  draw() {}

  setParent(parent) {
    // 이 객체의 부모 객체가 있다면
    // 부모 객체로부터 임시로 자식 객체를 제거한다.
    if (this.parent !== undefined) {
      const childName = this.parent.getChildNameByChildGameObj(this);
      delete this.parent.childGameObjDict[childName];
    }

    this.parent = parent;
    this.parent.addChild(this);
  }

  removeParent() {
    // 만약 이 객체의 부모가 있어야지만 부모 객체로부터 떨어져 나올 수 있다.
    if (this.parent !== undefined) {
      // 부모 객체에게 자식을 삭제하라는 명령으로
      // 자식 객체의 부모를 삭제하는 것과
      // 부모 객체의 자식 목록에서 자식 객체를 삭제하라는 것을 해결할 수 있다.
      this.parent.removeChild(this);
    }
  }

  removeChild(child) {
    const childName = this.getChildNameByChildGameObj(child);
    delete this.childGameObjDict[childName];

    // 자식 객체의 부모를 씬 객체로 변경한다.
    SceneManager.getCurrentScene().addChild(child);
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

  createChild(childName, gameObject) {
    if (childName in Object.keys(this.childTable) == false) {
      this.childTable[childName] = gameObject;
      gameObject.setParent(this);
    }
  }

  getChildNameByChildGameObj(child) {
    return Object.keys(this.childTable).find(
      (key) => child === this.childTable[key]
    );
  }

  getChild(childName) {
    return this.childTable[childName];
  }

  addPos(x, y) {
    this.transform.position.x += x;
    this.transform.position.y += y;
  }

  setPos(x, y) {
    this.transform.position.x = x;
    this.transform.position.y = y;
  }

  addScale(x, y) {
    this.transform.scale.x += x;
    this.transform.scale.y += y;
  }

  setScale(x, y) {
    this.transform.scale.x = x;
    this.transform.scale.y = y;
  }

  addRotation(degree) {
    this.transform.rotation += degree;
  }

  setRotation(degree) {
    this.transform.rotation = degree;
  }

  getPos() {
    return this.transform.position;
  }

  getScale() {
    return this.transform.scale;
  }

  getRotation() {
    return this.transform.rotation;
  }

  getMatrix() {
    return this.matrix;
  }

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
