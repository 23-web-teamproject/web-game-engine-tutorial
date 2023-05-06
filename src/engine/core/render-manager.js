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

import { typeCheckAndClamp } from "/src/engine/utils.js";

export default class RenderManager {
  static renderCanvasId = "render-canvas";
  static renderCanvas = undefined;
  static renderCanvasWidth;
  static renderCanvasHeight;
  static renderCanvasMinWidth = 800;
  static renderCanvasMinHeight = 600;
  static bufferCanvasId = "buffer-canvas";
  static bufferCanvas = undefined;

  constructor() {}

  /*
   * 현재 씬을 렌더링한다.
   */
  static render(alpha) {
    RenderManager.updateRenderCanvasSizeByWindowSize();
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
    RenderManager.changeRenderCanvasCSSSize(
      RenderManager.renderCanvasWidth,
      RenderManager.renderCanvasHeight
    );
  }

  /*
   * 브라우저의 크기에 따라 canvas의 크기를 변경한다.
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
    RenderManager.changeRenderCanvasCSSSize(
      renderCanvasStyleWidth,
      renderCanvasStyleHeight
    );
  }

  /*
   * renderCanvas의 style에 사용되는 변수를 업데이트하여
   * 화면에 나타나는 renderCanvans의 크기를 변경한다.
   */
  static changeRenderCanvasCSSSize(width, height) {
    const renderCanvas = RenderManager.getRenderCanvas();
    renderCanvas.style.setProperty("--render-canvas-width", width);
    renderCanvas.style.setProperty("--render-canvas-height", height);
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
