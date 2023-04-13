import GameObject from "/src/engine/core/game-object.js";
import HTMLFactory from "/src/engine/core/html-factory.js";

class Sprite extends GameObject {
  constructor(src) {
    super();
    this.src = src;
    this.findWidthAndHeightFromImage();
    this.cssManager.setBackgroundImage(src, this.imgWidth, this.imgHeight);
  }

  /*
   * div태그에 backgroundImage 속성으로 이미지를 보여주려고 하면
   * width와 height속성이 지정되지 않아 화면에 나타나지 않는다.
   * 그래서 img태그로 생성한 다음, naturalWidth, naturalHeight로
   * 가로 세로 길이를 구한다.
   */
  findWidthAndHeightFromImage() {
    const img = HTMLFactory.createImg(this.src);
    this.imgWidth = img.naturalWidth;
    this.imgHeight = img.naturalHeight;
    img.remove();
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  render() {
    super.render();
  }
}

export default Sprite;
