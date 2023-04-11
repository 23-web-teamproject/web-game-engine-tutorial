import GameObject from "/src/engine/core/game-object.js";
import HTMLFactory from "/src/engine/core/html-factory.js";

class Sprite extends GameObject {
  constructor(src) {
    super();
    this.src = src;
    this.findWidthAndHeightFromImage();
    this.insertImage();
  }
  
  findWidthAndHeightFromImage() {
    const img = HTMLFactory.createImg(this.src);
    this.imgWidth = img.naturalWidth;
    this.imgHeight = img.naturalHeight;
    img.remove();
  }
  
  insertImage(){
    this.element.style.backgroundImage = `url(${this.src})`;
    this.element.style.width = this.imgWidth;
    this.element.style.height = this.imgHeight;
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  render() {
    super.render();
  }
}

export default Sprite;
