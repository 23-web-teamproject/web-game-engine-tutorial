/*
 * main.js는 index.html에서 명시적으로 불러오고 있다.
 * 따라서 절대 지워서는 안된다.
 * 
 * main.js는 게임을 실행하기 전에 어떤 씬을 불러올 것인지를 결정한다.
 * 어떤 씬을 불러오려면 Engine내의 코드를 수정하지 않고,
 * registerInitialScene에 다른 씬 객체를 넣으면 된다.
 */
import Engine from "/src/engine/engine.js";
import ExampleScene from "/src/example-scene/scene.js";

Engine.init({
  width: 1280,
  height: 720,
  scene: ExampleScene
});
