import GameObject from "/src/engine/core/game-object.js";

export default class Sprite extends GameObject {
  constructor(src) {
    super();
    // TODO
    // src가 상대경로일 때도 처리해야함.
    this.image = new Image();
    this.image.src = src;
    this.updateSize();
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  render() {
    super.render();
  }

  draw() {
    this.context2d.drawImage(this.image, 0, 0);
  }

  updateSize() {
    this.transform.size.x = this.image.naturalWidth;
    this.transform.size.y = this.image.naturalHeight;
  }
}
