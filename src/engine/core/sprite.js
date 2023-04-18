import GameObject from "/src/engine/core/game-object.js";
import RenderManager from "/src/engine/core/render-manager.js";
import Path from "/src/engine/utils/path.js";

export default class Sprite extends GameObject {
  constructor(imagePath) {
    super();
    this.image = new Image();
    this.image.src = Path.convertAbsoluteAssetPath(imagePath);
    this.updateSize();

    this.isColorOverlayEnable = false;
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
      try {
        // 버퍼 캔버스를 초기화한다.
        const buffer = RenderManager.getBufferCanvas();
        const bufferCtx = buffer.getContext("2d");
        bufferCtx.clearRect(0, 0, buffer.width, buffer.height);

        // 버퍼 캔버스에 이미지를 렌더링한다.
        bufferCtx.drawImage(this.image, 0, 0);
        bufferCtx.globalCompositeOperation = "source-atop";

        // 버퍼 캔버스에 source-atop 방식으로 오버레이를 입힌다.
        const color = this.color.toArray();
        const alpha = 0.5;
        bufferCtx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
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

  updateSize() {
    this.image.onload = () => {
      this.transform.size.x = this.image.naturalWidth;
      this.transform.size.y = this.image.naturalHeight;
    }
  }

  enableColorOverlay() {
    this.isColorOverlayEnable = true;
  }

  disableColorOverlay() {
    this.isColorOverlayEnable = false;
  }
}
