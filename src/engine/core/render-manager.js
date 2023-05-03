/*
 * 렌더링을 위해 HTML에서 제공하는 API중 하나인 <canvas>를 사용한다.
 * RenderManager는 Canvas를 다루는 기능을 제공한다.
 *
 * Canvas는 두 개가 있는데, 화면에 드러날 renderCanvas와
 * 이미지에 오버레이를 씌우기 위해 쓰는 bufferCanvas가 있다.
 *
 * Canvas의 크기, 해상도를 바꾸는 책임도 맡는다.
 */
import SceneManager from "/src/engine/core/scene-manager.js";
import { clamp, typeCheck } from "/src/engine/utils.js";

export default class RenderManager {
  static renderCanvasId = "render-canvas";
  static renderCanvas = undefined;
  static renderCanvasWidth = 1280;
  static renderCanvasHeight = 720;
  static bufferCanvasId = "buffer-canvas";
  static bufferCanvas = undefined;

  constructor() {}

  /*
   * 현재 씬을 렌더링한다.
   */
  static render(alpha) {
    RenderManager.changeCanvasCSS();

    RenderManager.clearScreen();

    SceneManager.getCurrentScene().render(alpha);
  }

  /*
   * renderCanvas를 깨끗이 지운다.
   */
  static clearScreen() {
    const canvas = RenderManager.getRenderCanvas();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  /*
   * renderCanvas의 크기(width, height)를 변경한다.
   */
  static changeResolution(width, height) {
    RenderManager.renderCanvasWidth = typeCheck(
      width,
      "number",
      window.innerWidth
    );
    RenderManager.renderCanvasHeight = typeCheck(
      height,
      "number",
      window.innerHeight
    );

    const renderCanvas = RenderManager.getRenderCanvas();

    renderCanvas.width = clamp(
      RenderManager.renderCanvasWidth,
      0,
      window.innerWidth
    );
    renderCanvas.height = clamp(
      RenderManager.renderCanvasHeight,
      0,
      window.innerHeight
    );
  }

  /*
   * bufferCanvas의 크기(width, height)를 변경한다.
   */
  static changeBufferCanvasResolution(width, height) {
    const bufferCanvas = RenderManager.getBufferCanvas();
    bufferCanvas.width = width;
    bufferCanvas.height = height;
  }

  /*
   * renderCanvas를 getElementById로 찾아 반환한다.
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

  /*
   * bufferCanvas를 getElementById로 찾아 반환한다.
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
