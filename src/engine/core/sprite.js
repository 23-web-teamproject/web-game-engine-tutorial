/*
 * 화면에 이미지를 가진 객체를 보여지게 하고 싶으면 이 객체를 사용한다.
 */
import GameObject from "/src/engine/core/game-object.js";
import RenderManager from "/src/engine/core/render-manager.js";
import Color from "/src/engine/data-structure/color.js";
import Path from "/src/engine/utils/path.js";

export default class Sprite extends GameObject {
  constructor(options = {}) {
    super(options);
    /*
     * 화면에 보여질 이미지이다.
     */
    this.image = new Image();
    if (typeof options.imagePath === "string") {
      this.image.src = Path.convertToAbsoluteAssetPath(options.imagePath);
    } else {
      Path.setAssetFolderPath("/src/engine/assets/");
      this.image.src = Path.convertToAbsoluteAssetPath(
        "defaultSpriteImage.png"
      );
    }

    /*
     * 색상 오버레이를 씌울 것인지를 나타낸다.
     * 기본값으로는 false다.
     */
    if (typeof options.colorOverlayEnable === "boolean") {
      this.isColorOverlayEnable = options.colorOverlayEnable;
    } else {
      this.isColorOverlayEnable = false;
    }

    /*
     * 색상 오버레이를 씌울 때 어떤 색을 씌울 것인지를 나타낸다.
     * 만약 이 색의 Alpha가 1이면 이미지 전체에 불투명한 색을 덧입히기 때문에
     * 완전히 다른 색으로 덮히게 되어 이미지가 보이지 않는다.
     */
    if (options.overlayColor instanceof Color) {
      this.overlayColor = options.overlayColor;
    } else {
      this.overlayColor = new Color(0, 0, 0, 0.5);
    }

    this.updateSize();
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  /*
   * 도형이나 텍스트는 렌더링을 할 때 색상을 설정하여 입힐 수 있지만,
   * 이미지는 그렇지 않다.
   * getImageData로 캔버스의 특정 영역의 색상값을 읽어올 수 있지만,
   * 다른 이미지와 겹쳐졌을 때에는 원하는 결과를 얻을 수 없다.
   * 따라서 아래의 과정을 거쳐 오버레이를 씌울 수 있다.
   *
   * 빈 버퍼 캔버스에 미리 이미지를 그린다.
   * 그 후 버퍼 캔버스에 컬러 오버레이를 씌운다.
   * 완성된 버퍼 캔버스를 주 캔버스에 렌더링한다.
   *
   * TODO
   * 색깔을 입힐 수는 있지만 rgb(255, 0, 0) 처럼 빨간색만 씌운다고 할 때
   * 이미지 전체가 빨갛게 변해버린다.
   * 알파값을 조절해서 빨간색 오버레이를 씌운 것처럼 보이게 할 수 있지만
   * 물빠진 색감이 되어버린다.
   */
  draw() {
    if (this.isColorOverlayEnable) {
      // 버퍼 캔버스의 크기를 현재 이미지의 크기로 설정한다.
      const size = this.transform.size;

      // 만약 이미지의 size가 0x0일 경우 drawImage()를 실행할 때
      // 크기가 0인 이미지를 그린다는 에러가 일어난다.
      // 그럴 경우를 위해 try-catch로 감싸주어 에러를 숨겼다.
      try {
        // 버퍼 캔버스를 초기화한다.
        const buffer = RenderManager.getBufferCanvas();
        const bufferCtx = buffer.getContext("2d");
        bufferCtx.clearRect(0, 0, buffer.width, buffer.height);

        // 버퍼 캔버스에 이미지를 렌더링한다.
        bufferCtx.drawImage(this.image, 0, 0);
        bufferCtx.globalCompositeOperation = "source-atop";

        // 버퍼 캔버스에 source-atop 방식으로 오버레이를 입힌다.
        bufferCtx.fillStyle = `rgba(${this.overlayColor.r},${this.overlayColor.g},${this.overlayColor.b},${this.overlayColor.a})`;
        bufferCtx.fillRect(0, 0, size.x, size.y);
        bufferCtx.globalCompositeOperation = "source-over";

        // 버퍼 캔버스에 그려진 이미지를 주 캔버스에 렌더링한다.
        this.context2d.drawImage(buffer, 0, 0);
      } catch (error) {
        throw error;
      }
    } else {
      this.context2d.drawImage(this.image, 0, 0);
    }
  }

  /*
   * 이 객체의 물리적인 크기를 이미지의 크기로 설정한다.
   */
  updateSize() {
    this.image.onload = () => {
      this.transform.size.x = this.image.naturalWidth;
      this.transform.size.y = this.image.naturalHeight;
    };
  }

  /*
   * 색상 오버레이를 켠다.
   */
  enableColorOverlay() {
    this.isColorOverlayEnable = true;
  }

  /*
   * 색상 오버레이를 끈다.
   */
  disableColorOverlay() {
    this.isColorOverlayEnable = false;
  }

  /*
   * 색상 오버레이의 색을 설정한다.
   */
  setOverlayColor(color) {
    this.overlayColor = color;
  }
}
