import Vector from "/src/engine/data-structure/vector.js";
import SceneManager from "/src/engine/core/scene-manager.js";

import { typeCheckAndClamp } from "/src/engine/utils.js";

/**
 * 렌더링을 위해 HTML에서 제공하는 API중 하나인 <canvas>를 사용한다.
 * RenderManager는 Canvas를 다루는 기능을 제공한다.
 *
 * Canvas는 두 개가 있는데, 화면에 드러날 renderCanvas와
 * 이미지에 오버레이를 씌우기 위해 쓰는 bufferCanvas가 있다.
 *
 * Canvas의 크기, 해상도를 바꾸는 책임도 맡는다.
 */
class RenderManager {
  /**
   * renderCanvas의 id값
   *
   * @property {string}
   * @static
   */
  static renderCanvasId = "render-canvas";
  /**
   * renderCanvas의 Element요소
   *
   * @property {RenderCanvasContext2d}
   * @static
   */
  static renderCanvas = undefined;
  /**
   * renderCanvans의 가로 길이
   *
   * @property {number}
   * @static
   */
  static renderCanvasWidth;
  /**
   * renderCanvans의 세로 길이
   *
   * @property {number}
   * @static
   */
  static renderCanvasHeight;
  /**
   * renderCanvans의 최소 가로 길이
   *
   * @property {number}
   * @static
   */
  static renderCanvasMinWidth = 800;
  /**
   * renderCanvans의 최소 세로 길이
   *
   * @property {number}
   * @static
   */
  static renderCanvasMinHeight = 600;
  /**
   * bufferCanvas의 id값
   *
   * @property {string}
   * @static
   */
  static bufferCanvasId = "buffer-canvas";
  /**
   * bufferCanvas의 Element요소
   *
   * @property {RenderCanvasContext2d}
   * @static
   */
  static bufferCanvas = undefined;

  constructor() {}

  /**
   * 현재 씬을 렌더링한다.
   * 1. 먼저 게임화면의 크기를 브라우저의 크기에 맞춘다.
   * 2. 그다음 화면을 지운다.
   * 3. 깨끗해진 화면에 현재 프레임의 모든 오브젝트를 렌더링한다.
   */
  static render() {
    RenderManager.updateRenderCanvasSizeByWindowSize();
    RenderManager.clearScreen();
    SceneManager.getCurrentScene().render();
  }

  /**
   * renderCanvas를 깨끗이 지운다.
   */
  static clearScreen() {
    const canvas = RenderManager.getRenderCanvas();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * renderCanvas의 크기(width, height)를 변경한다.
   * 크기를 변경하면 style에도 영향이 있기 때문에 renderCanvas의 CSS도 변경한다.
   *
   * @param {number} width - 가로 크기
   * @param {number} height - 세로 크기
   */
  static changeResolution(width, height) {
    RenderManager.renderCanvasWidth = typeCheckAndClamp(
      width,
      "number",
      1280,
      RenderManager.renderCanvasMinWidth,
      Number.MAX_VALUE
    );
    RenderManager.renderCanvasHeight = typeCheckAndClamp(
      height,
      "number",
      720,
      RenderManager.renderCanvasMinHeight,
      Number.MAX_VALUE
    );

    const renderCanvas = RenderManager.getRenderCanvas();
    renderCanvas.width = RenderManager.renderCanvasWidth;
    renderCanvas.height = RenderManager.renderCanvasHeight;
    RenderManager.changeRenderCanvasStyleVariable(
      RenderManager.renderCanvasWidth,
      RenderManager.renderCanvasHeight
    );
  }

  /**
   * 브라우저의 크기에 따라 canvas의 크기를 조절한다.
   * 조절한 크기를 renderCanvas의 style에 적용한다.
   */
  static updateRenderCanvasSizeByWindowSize() {
    const canvasRatio =
      RenderManager.renderCanvasWidth / RenderManager.renderCanvasHeight;

    let renderCanvasStyleWidth = RenderManager.renderCanvasWidth;
    let renderCanvasStyleHeight = RenderManager.renderCanvasHeight;
    // 화면의 세로 길이가 canvas의 세로 길이보다 작다면
    // canvas의 가로 길이를 화면의 가로 길이로 설정한다.
    if (window.innerHeight < RenderManager.renderCanvasHeight) {
      renderCanvasStyleHeight = window.innerHeight;
    }
    // 화면의 가로 길이가 canvas의 가로 길이보다 작다면
    // canvas의 가로 길이를 화면의 가로 길이로 설정한다.
    if (window.innerWidth < RenderManager.renderCanvasWidth) {
      renderCanvasStyleWidth = window.innerWidth;
    }

    const newRatio = renderCanvasStyleWidth / renderCanvasStyleHeight;
    // w : h = newW : newH
    // newW가 더 길다면 newW = w * newH/h = newH * w/h
    // newH가 더 길다면 newH = h * newW/w = newW * h/w
    if (newRatio > canvasRatio) {
      renderCanvasStyleWidth = renderCanvasStyleHeight * canvasRatio;
    } else if (newRatio < canvasRatio) {
      renderCanvasStyleHeight = renderCanvasStyleWidth / canvasRatio;
    }

    // 완성된 크기를 canvas의 style에 업데이트한다.
    RenderManager.changeRenderCanvasStyleVariable(
      renderCanvasStyleWidth,
      renderCanvasStyleHeight
    );
  }

  /**
   * renderCanvas의 style에 사용되는 변수를 업데이트하여
   * 화면에 나타나는 renderCanvans의 크기를 변경한다.
   *
   * @param {number} width - 가로 크기
   * @param {number} height - 세로 크기
   */
  static changeRenderCanvasStyleVariable(width, height) {
    const root = document.querySelector(":root");
    root.style.setProperty("--render-canvas-width", width);
    root.style.setProperty("--render-canvas-height", height);
  }

  /**
   * 화면상으로 보이는 renderCanvas의 크기를 반환한다.
   * 앞서 화면 크기에 따라 변경한 renderCanvas의 css변수중
   * --render-canvas-width와 --render-canvas-height를 말한다.
   *
   * @returns {Vector}
   */
  static getActualRenderCanvasSize() {
    const root = document.querySelector(":root");
    const actualWidth = root.style.getPropertyValue("--render-canvas-width");
    const actualHeight = root.style.getPropertyValue("--render-canvas-height");
    return new Vector(actualWidth, actualHeight);
  }

  /**
   * bufferCanvas의 크기(width, height)를 변경한다.
   *
   * @param {number} width - 가로 크기
   * @param {number} height - 세로 크기
   */
  static changeBufferCanvasResolution(width, height) {
    const bufferCanvas = RenderManager.getBufferCanvas();
    bufferCanvas.width = width;
    bufferCanvas.height = height;
  }

  /**
   * renderCanvas를 getElementById로 찾아 반환한다.
   * 만약 존재하지 않는 element라면 새로 element를 생성해 반환한다.
   *
   * @returns {RenderCanvasContext2d}
   */
  static getRenderCanvas() {
    if (RenderManager.renderCanvas === undefined) {
      RenderManager.renderCanvas = document.getElementById(
        RenderManager.renderCanvasId
      );
    }

    if (RenderManager.renderCanvas === undefined) {
      RenderManager.renderCanvas = document.createElement("canvas");
      RenderManager.renderCanvas.id = RenderManager.renderCanvasId;
    }

    return RenderManager.renderCanvas;
  }

  /**
   * bufferCanvas를 getElementById로 찾아 반환한다.
   * 만약 존재하지 않는 element라면 새로 element를 생성해 반환한다.
   *
   * @returns {RenderCanvasContext2d}
   */
  static getBufferCanvas() {
    if (RenderManager.bufferCanvas === undefined) {
      RenderManager.bufferCanvas = document.getElementById(
        RenderManager.bufferCanvasId
      );
    }

    if (
      RenderManager.bufferCanvas === undefined ||
      RenderManager.bufferCanvas === null
    ) {
      const bufferCanvas = document.createElement("canvas");
      bufferCanvas.id = RenderManager.bufferCanvasId;
      RenderManager.bufferCanvas = bufferCanvas;
    }
    return RenderManager.bufferCanvas;
  }
}

export default RenderManager;
