import { GameObject, Text, Color, Vector, Rect, Circle, InputManager, Debug } from "/src/engine/module.js";

export default class ExampleScene extends GameObject {
  constructor() {
    super();
    // this.ground = new Rect({
    //   width: 1000,
    //   height: 50,
    //   isPhysicsEnable: true,
    //   transform: {
    //     position: new Vector(640, 600),
    //   },
    //   rigidbody: {
    //     isStatic: true, // 이 값이 true면 물리 효과가 적용되지만 좌표는 바뀌지 않습니다.
    //   },
    // });

    // // 땅과 충돌할 때 실행될 이벤트함수를 정의하여 
    // // 어떤 물체가 충돌되었는지 개발자 도구를 통해 확인해볼 수 있습니다.
    // this.ground.onCollision = (other) => {
    //   console.log(other);
    // };

    // this.addChild(this.ground);

    // for (let i = 0; i < 50; i++) {
    //   this.addChild(
    //     new Rect({
    //       width: 10 + Math.random() * 30,
    //       height: 10 + Math.random() * 30,
    //       isPhysicsEnable: true,
    //       transform: {
    //         position: new Vector(
    //           490 + Math.random() * 300,
    //           100 - Math.random() * 300
    //         ),
    //       },
    //       rigidbody: {
    //         isGravity: true,
    //       },
    //     })
    //   );
    //   this.addChild(
    //     new Circle({
    //       radius: 10 + Math.random() * 30,
    //       isPhysicsEnable: true,
    //       transform: {
    //         position: new Vector(
    //           490 + Math.random() * 300,
    //           100 - Math.random() * 300
    //         ),
    //       },
    //       rigidbody: {
    //         isGravity: true,
    //       },
    //     })
    //   );
    // }

    this.rect = new Rect({
      width: 100, height: 100,
      color: new Color(255, 0, 0, 1),
      transform: {
        position: new Vector(100,100),
        scale: new Vector(2, 2)
      }
    });
    this.addChild(this.rect);
    this.rect2 = new Rect({
      width: 100,
      height: 100,
      transform: {
        position: new Vector(100, 100),
      }
    });
    this.rect.addChild(this.rect2);
    this.addChild(new Rect({
      width: 100, height:100,
      transform: {
        position: new Vector(600,600)
      }
    }));
  }

  update(deltaTime){
    if(InputManager.isKeyDown("d")){
      // this.rect2.addRotation(15);
      this.rect2.setPosition(new Vector(400, 400)); // localposition이 (100,100)이 되어야함
    }
    if(InputManager.isKeyDown("e")){
      // this.rect.addLocalPosition(new Vector(10, 0));
      this.rect.addRotation(15);
    }
  }
}
