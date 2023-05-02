import RenderManager from "/src/engine/core/render-manager.js";

export default class CanvasManager {
  constructor() {}

  static getContext2D() {
    return RenderManager.getCurrentRenderTarget().getContext("2d");
  }  
}