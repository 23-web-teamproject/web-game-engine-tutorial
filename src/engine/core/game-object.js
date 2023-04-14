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
    this.childGameObjs = new Array();
    this.parentGameObj = undefined;
  }

  /*
   * GameObject 내에서는 단순히 이 오브젝트에 등록된
   * 하위 GameObject들의 update를 실행시킨다.
   */
  update(deltaTime) {
    this.childGameObjs.forEach((child) => {
      child.update(deltaTime);
    });
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

    this.childGameObjs.forEach((child) => {
      child.render();
    });
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
    return this.parentGameObj !== undefined;
  }

  multiplyParentMatrix() {
    const parentMatrix = this.parentGameObj.getMatrix();
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

  addChild(childGameObj) {
    const index = this.childGameObjs.indexOf(childGameObj);
    // 만약 이미 있는 자식 객체라면 추가하지 않음.
    if (index == -1) {
      // 인자로 전달받은 객체를 자식 목록에 추가한다.
      this.childGameObjs.push(childGameObj);

      // 자식 객체의 부모를 이 객체로 변경한다.
      childGameObj.parentGameObj = this;
    }
  }

  removeChild(childGameObj) {
    const index = this.childGameObjs.indexOf(childGameObj);
    if (index != -1) {
      // 만약 인자로 전달받은 객체가 자식 객체라면 자식 목록에서 삭제한다.
      this.childGameObjs.splice(index, 1);
    }

    // 자식 객체의 부모를 씬 객체로 변경한다.
    SceneManager.getCurrentScene().addChild(childGameObj);
  }

  setParent(parentGameObj) {
    // 이 객체의 부모 객체가 있다면
    // 부모 객체로부터 임시로 자식 객체를 제거하고,
    // 자식 객체의 부모를 인자로 전달받은 부모 객체로 변경한다.
    if (this.parentGameObj !== undefined) {
      const index = this.parentGameObj.childGameObjs.indexOf(this);
      if (index != -1) {
        this.parentGameObj.childGameObjs.splice(index, 1);
        this.parentGameObj = parentGameObj;
        this.parentGameObj.addChild(this);
      }
    }
  }

  removeParent() {
    // 만약 이 객체의 부모가 있어야지만 부모 객체로부터 떨어져 나올 수 있다.
    if (this.parentGameObj !== undefined) {
      // 부모 객체에게 자식을 삭제하라는 명령으로
      // 자식 객체의 부모를 삭제하는 것과
      // 부모 객체의 자식 목록에서 자식 객체를 삭제하라는 것을 해결할 수 있다.
      this.parentGameObj.removeChild(this);
    }
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
     *
     * 그리고 DOM에서도 삭제되어야 완전히 제거된 것이므로,
     * html element도 삭제하면 된다.
     */
    if (this.parentGameObj !== undefined) {
      this.removeParent();
    }

    while (this.childGameObjs.length) {
      this.childGameObjs[0].destroy();
    }
  }
}
