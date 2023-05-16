import { GameObject, Color, Vector } from "/src/engine/module.js";

export default class TutorialScene2 extends GameObject {
  constructor() {
    super();
    this.newObject = new GameObject({
      // 여기서 객체의 세부 속성을 수정할 수 있다.
      color: new Color(255, 0, 0, 1), // 색상
      transform: {
        position: new Vector(0, 0), // 좌표
        scale: new Vector(0, 0), // 규모
        rotation: 0, // 회전
      },
      isPhysicsEnable: false, // 물리효과를 적용할 것인가?
      rigidbody: {
        isGravity: false, // 중력을 받을 것인가?
        isStatic: true, // 물리적인 상호작용을 받되, 속도와 가속도, 좌표가 불변하는 객체인가?
      },
    });

    // 씬의 자식으로 만들어 자동으로 물리효과를 연산하고, 화면에 렌더링되도록 한다.
    this.addChild(this.newObject);
    // 만약 씬에 등록하지 않았다면 직접 update와 render에서 객체의 update와 render를 호출하면 된다.
  }

  update(deltaTime) {
    // GameObject에 정의되어 있는 update함수를 재정의하여 로직을 구성한다.
    super.update(deltaTime); // 이 함수를 재정의하게 된다면 항상 이 코드를 제일 먼저 실행하도록 해야한다.

    // this.newObject.update(deltaTime); // 씬에 newObject를 자식으로 만들지 않았다면 직접 update를 호출해야한다.
  }

  render(alpha) {
    // update와 마찬가지로 재정의하여 렌더링 순서를 바꿀 수 있다.
    super.render(alpha); // 이 함수를 재정의하게 된다면 항상 이 코드를 제일 먼저 실행하도록 해야한다.
  }
}
