import SceneManager from "/src/engine/core/scene-manager.js";

export default class RenderManager {
  static renderCanvasId = "render-canvas";
  static renderCanvas = undefined;
  static renderCanvasWidth = 1280;
  static renderCanvasHeight = 720;
  static bufferCanvasId = "buffer-canvas";
  static bufferCanvas = undefined;

  constructor() {}

  static render() {
    SceneManager.getCurrentScene().render();
    const canvas = RenderManager.getRenderCanvas();
  }

  static clearScreen() {
    const canvas = RenderManager.getRenderCanvas();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  static changeResolution(width, height) {
    RenderManager.renderCanvasWidth = width;
    RenderManager.renderCanvasHeight = height;

    const renderCanvas = RenderManager.getRenderCanvas();
    renderCanvas.width = RenderManager.renderCanvasWidth;
    renderCanvas.height = RenderManager.renderCanvasHeight;

    RenderManager.changeBufferCanvasResolution(width, height);
  }

  static changeBufferCanvasResolution(width, height) {
    const bufferCanvas = RenderManager.getBufferCanvas();
    bufferCanvas.width = width;
    bufferCanvas.height = height;
  }

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
