import Color from "/src/engine/data-structure/color.js";
import Vector from "/src/engine/data-structure/vector.js";

import GameObject from "/src/engine/core/game-object.js";
import RenderManager from "/src/engine/core/render-manager.js";
import ResourceManager from "/src/engine/core/resource-manager.js";

import Path from "/src/engine/utils/path.js";
import { typeCheck, typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 화면에 이미지를 그리는 객체다.
 *
 * @extends {GameObject}
 */
class Sprite extends GameObject {
  /**
   * @constructor
   * @param {object} options
   * @param {string} [options.name]
   * @param {string} [options.imagePath]
   * @param {boolean} [options.isColorOverlayEnable]
   * @param {Color} [options.overlayColor]
   * @param {boolean} [options.isActive]
   * @param {boolean} [options.isVisible]
   * @param {Layer} [options.layer]
   * @param {boolean} [options.isPhysicsEnable=false]
   * @param {object} [options.boundary]
   * @param {number} [options.boundary.width]
   * @param {number} [options.boundary.height]
   * @param {number} [options.boundary.offset]
   * @param {object} [options.transform]
   * @param {Vector} [options.transform.position=new Vector(0, 0)]
   * @param {Vector} [options.transform.scale=new Vector(1, 1)]
   * @param {number} [options.transform.rotation=0]
   * @param {object} [options.rigidbody]
   * @param {number} [options.rigidbody.mass=1]
   * @param {number} [options.rigidbody.bounceness=0.5]
   * @param {number} [options.rigidbody.staticFriction=0.2]
   * @param {number} [options.rigidbody.dynamicFriction=0.1]
   * @param {boolean} [options.rigidbody.isStatic=false]
   * @param {boolean} [options.rigidbody.isGravity=false]
   * @param {boolean} [options.rigidbody.isTrigger=false]
   */
  constructor(options = {}) {
    super(options);
    // 이미지가 완전히 로딩되기 전까지 isActive를 false로 만든다.
    this.deactivate();

    /**
     * 화면에 보여질 이미지를 의미한다.
     *
     * @type {HTMLImageElement}
     */
    this.image = ResourceManager.loadResource(options.imagePath, Image, () => {
      this.transform.setSize(
        new Vector(this.image.naturalWidth, this.image.naturalHeight)
      );

      // 외형의 크기가 주어지지 않았다면 이미지의 크기를 외형의 크기로 설정한다.
      const boundary = this.collider.getBoundary();
      if (boundary.x === 0) {
        boundary.x = this.getSize().x;
      }
      if (boundary.y === 0) {
        boundary.y = this.getSize().y;
      }
      this.collider.setBoundary(boundary);

      // 이미지가 완전히 불러와졌다면 isActive를 true로 만든다.
      this.activate();
    });

    /**
     * 색상 오버레이를 씌울 것인지를 의미한다.
     * 기본값은 false다.
     *
     * @type {boolean}
     */
    this.isColorOverlayEnable = typeCheck(
      options.isColorOverlayEnable,
      "boolean",
      false
    );
    /**
     * 색상 오버레이를 씌울 때 어떤 색을 씌울 것인지를 의미한다.
     * 만약 이 색의 Alpha가 1이면 이미지 전체에 불투명한 색을 덧입히기 때문에
     * 완전히 다른 색으로 덮히게 되어 이미지가 보이지 않는다.
     *
     * @type {Color}
     */
    this.overlayColor = typeCheck(
      options.overlayColor,
      Color,
      new Color(0, 0, 0, 0.5)
    );

    this.updateSize();
  }

  /**
   * 도형이나 텍스트는 렌더링을 할 때 색상을 설정하여 입힐 수 있지만,
   * 이미지는 그렇지 않다.
   * getImageData로 캔버스의 특정 영역의 색상값을 읽어올 수 있지만,
   * 다른 이미지와 겹쳐졌을 때에는 원하는 결과를 얻을 수 없다.
   * 따라서 아래의 과정을 거쳐 오버레이를 씌울 수 있다.
   *
   * 1. 빈 버퍼 캔버스에 미리 이미지를 그린다.
   * 2. 그 후 버퍼 캔버스에 컬러 오버레이를 씌운다.
   * 3. 완성된 버퍼 캔버스를 주 캔버스에 렌더링한다.
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
      const size = this.getSize();

      // 버퍼 캔버스를 초기화한다.
      const buffer = RenderManager.getBufferCanvas();
      const bufferCtx = buffer.getContext("2d");
      bufferCtx.clearRect(0, 0, buffer.width, buffer.height);

      // 버퍼 캔버스에 이미지를 렌더링한다.
      bufferCtx.drawImage(this.image, 0, 0);
      bufferCtx.globalCompositeOperation = "source-atop";

      // 버퍼 캔버스에 source-atop 방식으로 오버레이를 입힌다.
      bufferCtx.fillStyle = `rgba(
          ${this.overlayColor.r},
          ${this.overlayColor.g},
          ${this.overlayColor.b},
          ${this.overlayColor.a}
        )`;
      bufferCtx.fillRect(0, 0, size.x, size.y);
      bufferCtx.globalCompositeOperation = "source-over";

      // 버퍼 캔버스에 그려진 이미지를 주 캔버스에 렌더링한다.
      this.context2d.drawImage(buffer, -size.x / 2, -size.y / 2);
    } else {
      this.context2d.drawImage(
        this.image,
        -this.getSize().x / 2,
        -this.getSize().y / 2
      );
    }
  }

  /**
   * 이 객체의 물리적인 크기를 이미지의 크기로 설정한다.
   */
  updateSize() {
    this.image.addEventListener("load", () => {
      this.transform.setSize(
        new Vector(this.image.naturalWidth, this.image.naturalHeight)
      );
    });
  }

  /**
   * 색상 오버레이를 켠다.
   */
  enableColorOverlay() {
    this.isColorOverlayEnable = true;
  }

  /**
   * 색상 오버레이를 끈다.
   */
  disableColorOverlay() {
    this.isColorOverlayEnable = false;
  }

  /**
   * 색상 오버레이의 색을 설정한다.
   *
   * @param {Color} color - 오버레이로 사용할 색상값
   */
  setOverlayColor(color) {
    this.overlayColor = color;
  }
}

export default Sprite;
