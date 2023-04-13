import GameObject from "/src/engine/core/game-object.js";

class Sprite extends GameObject {
  constructor(src) {
    super();
    // TODO
    // src가 상대경로일 때도 처리해야함.
    this.image = new Image();
    this.image.src = src;
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  render() {
    super.render();
  }

  draw() {
    // TODO
    // canvas의 출력 기준점(transformOrigin)은 좌상단이다.
    // 회전을 한다고 치면 좌상단을 기준으로 회전한다.
    // 그러므로 만약 가운데를 기준으로 회전해야한다면,
    // 그냥 출력 위치를 크기의 절반만큼 이동시켜서 출력하면 된다.
    // 하지만 이럴경우 진짜 position이 달라질 수 있다.
    this.context2d.drawImage(
      this.image, 
      -this.image.naturalWidth / 2,
      -this.image.naturalHeight / 2
      );
  }
}

export default Sprite;
