export default class RenderManager {
  static renderTargetId = "render-target";
  
  constructor() {}
  
  static getCurrentRenderTarget(){
    return document.getElementById(RenderManager.renderTargetId);
  }

  static clearScreen() {
    const canvas = RenderManager.getCurrentRenderTarget();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }
}
