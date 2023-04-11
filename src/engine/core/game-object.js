import CSSManager from "/src/engine/core/css-manager.js";
import HTMLFactory from "/src/engine/core/html-factory.js";
import SceneManager from "/src/engine/core/scene-manager.js";
import Matrix from "/src/engine/core/matrix.js";

export default class GameObject {
  constructor() {
    this.element = HTMLFactory.create();
    this.cssManager = new CSSManager(this.element);

    this.matrix = new Matrix();
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
   */
  render() {
    this.cssManager.updateMatrix(this.matrix);

    this.childGameObjs.forEach((child) => {
      child.render();
    });
  }

  /*
   * 이 객체의 하위에 childGameObj를 넣는다.
   * 자식 리스트에서 제일 뒤에 삽입된다.
   *
   * <!-- from -->
   * <GameObject>         <-- this
   *   ...
   * </GameObject>
   * ...
   * <childGameObj>     <-- child
   * </childGameObj>
   *
   * <!-- to -->
   * <GameObject>         <-- this
   *   ...
   *   <childGameObj>     <-- child
   *   </childGameObj>
   * </GameObject>
   * ...
   */
  addChild(childGameObj) {
    const index = this.childGameObjs.indexOf(childGameObj);
    if (index == -1) {
      // 하위 목록에 추가
      this.childGameObjs.push(childGameObj);
      // child를 현재 GameObject의 html의 하위로 이동.
      // 이동하면서 자동으로 element.parentElement도 현재 element로 변경된다.
      this.element.appendChild(childGameObj.element);
      // childGameObj의 parentGameObj를 현재 GameObject로 변경.
      childGameObj.parentGameObj = this;
    }
  }

  /*
   * 현재 GameObject의 하위에서 childGameObj를 제거한다.
   * 제거된 childGameObj는 currentRenderTarget으로 돌아간다.
   *
   * <!-- from -->
   * <currentRenderTarget>
   *   <GameObject>        <-- this
   *     <childGameObj>    <-- child
   *     </childGameObj>
   *     ...
   *   </GameObject>
   *   ...
   * </currentRenderTarget>
   *
   * <!-- to -->
   * <currentRenderTarget>
   *   <GameObject>        <-- this
   *     ...
   *   </GameObject>
   *   ...
   *   <childGameObj>      <-- child
   *   </childGameObj>
   * </currentRenderTarget>
   */
  removeChild(childGameObj) {
    const index = this.childGameObjs.indexOf(childGameObj);
    if (index != -1) {
      // 현재 GameObject의 list에 있는 childGameObject제거.
      this.childGameObjs.splice(index, 1);
      // childElement를 currentRenderTarget의 하위로 이동.
      // 이동하면서 parentElement의 children과 childElement의 parentElement는
      // 자동으로 변경된다.
      SceneManager.getCurrentSceneElement().appendChild(childGameObj.element);
    }
  }

  /*
   * 이 GameObject의 부모를 parentGameObj로 설정한다.
   * parentGameObj의 하위로 GameObject가 이동하게 된다.
   *
   * <!-- from -->
   * <parentGameObj>      <-- parent
   *   ...
   * </parentGameObj>
   * ...
   * <GameObject>       <-- this
   * </GameObject>
   *
   * <!-- to -->
   * <parentGameObj>      <-- parent
   *   ...
   *   <GameObject>       <-- this
   *   </GameObject>
   * </parentGameObj>
   */
  setParent(parentGameObj) {
    if (this.parentGameObj === undefined) {
      // 부모 GameObject를 등록.
      this.parentGameObj = parentGameObj;
      // 현재 element를 부모 element의 하위로 이동.
      this.parentGameObj.element.appendChild(this.element);
    }
  }

  /*
   * 이 GameObject를 부모로부터 분리한다.
   * GameObject는 currentRenderTarget의 하위로 이동하게 된다.
   *
   * <!-- from -->
   * 
   * <renderTarget>
   *   <parentGameObj>     <-- parent
   *     <GameObject>      <-- this
   *     </GameObject>
   *   </parentGameObj>
   *   ...
   * </renderTarget>
   *
   * <!-- to -->
   * 
   * <renderTarget>
   *   <parentGameObj>     <-- parent
   *   </parentGameObj>
   *   ...
   *   <GameObject>        <-- this
   *   </GameObject>
   * </renderTarget>
   */
  removeParent() {
    if (this.parentGameObj !== undefined) {
      // 부모 GameObject에서 현재 GameObject를 제거.
      const index = this.parentGameObj.childGameObjs.indexOf(this);
      if (index != -1) {
        this.parentGameObj.childGameObjs.splice(index, 1);
      }

      this.parentGameObj = undefined;
      // 현재 element를 currentRenderTarget하위로 이동.
      // 이동하면서 자동으로 html속성을 변경시켜줌.
      // addChild(), removeChild(), setParent() 참고.
      SceneManager.getCurrentSceneElement().appendChild(this.element);
    }
  }

  addPos(x, y) {
    this.matrix.position.x += x;
    this.matrix.position.y += y;
  }

  setPos(x, y) {
    this.matrix.position.x = x;
    this.matrix.position.y = y;
  }

  addScale(x, y) {
    this.matrix.scale.x += x;
    this.matrix.scale.y += y;
  }

  setScale(x, y) {
    this.matrix.scale.x = x;
    this.matrix.scale.y = y;
  }

  addRotation(degree) {
    this.matrix.rotation += degree;
  }

  setRotation(degree) {
    this.matrix.rotation = degree;
  }
}
