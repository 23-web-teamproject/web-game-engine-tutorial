import SceneManager from "/src/engine/core/scene-manager.js";

export default class RenderManager {
  static renderTargetId = "render-target";
  static renderTarget = undefined;
  static renderTargetWidth = 1280;
  static renderTargetHeight = 720;
  static bufferRenderTarget = undefined;
  static bufferRenderTargetId = "buffer-render-target";

  constructor() {}

  static getCurrentRenderTarget() {
    if (RenderManager.renderTarget === undefined) {
      RenderManager.renderTarget = document.getElementById(
        RenderManager.renderTargetId
      );
    }

    if (RenderManager.renderTarget === undefined) {
      RenderManager.renderTarget = document.createElement("canvas");
      RenderManager.renderTarget.id = RenderManager.renderTargetId;
    }

    return RenderManager.renderTarget;
  }

  static clearScreen() {
    const canvas = RenderManager.getCurrentRenderTarget();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  static render() {
    SceneManager.getCurrentScene().render();
    const canvas = RenderManager.getCurrentRenderTarget();
  }

  static getBufferRenderTarget() {
    if (RenderManager.bufferRenderTarget === undefined) {
      RenderManager.bufferRenderTarget = document.getElementById(
        RenderManager.bufferRenderTargetId
      );
    }

    if (
      RenderManager.bufferRenderTarget === undefined ||
      RenderManager.bufferRenderTarget === null
    ) {
      const bufferRenderTarget = document.createElement("canvas");
      bufferRenderTarget.id = RenderManager.bufferRenderTargetId;
      RenderManager.bufferRenderTarget = bufferRenderTarget;
    }
    return RenderManager.bufferRenderTarget;
  }

  static changeResolution(width, height) {
    RenderManager.renderTargetWidth = width;
    RenderManager.renderTargetHeight = height;

    const renderTarget = RenderManager.getCurrentRenderTarget();
    renderTarget.width = RenderManager.renderTargetWidth;
    renderTarget.height = RenderManager.renderTargetHeight;

    RenderManager.changeBufferRenderTargetResolution(width, height);
  }

  static changeBufferRenderTargetResolution(width, height) {
    const bufferRenderTarget = RenderManager.getBufferRenderTarget();
    bufferRenderTarget.width = width;
    bufferRenderTarget.height = height;
  }
}
