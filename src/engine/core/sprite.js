import GameObject from "/src/engine/core/game-object.js";
import Path from "/src/engine/utils/path.js";

export default class Sprite extends GameObject {
  constructor(imagePath) {
    super();
    this.image = new Image();
    this.image.src = Path.convertAbsoluteAssetPath(imagePath);
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
