import Engine from "/src/engine/engine.js";
import TutorialScene1 from "../tutorial/1-engine-initialization/scene.js";
import TutorialScene2 from "../tutorial/2-create-game-object/scene.js";
import TutorialScene3 from "../tutorial/3-input-manager/scene.js";
import TutorialScene4 from "../tutorial/4-rect-and-circle/scene.js";
import TutorialScene5 from "../tutorial/5-text/scene.js";
import TutorialScene6 from "../tutorial/6-sprite/scene.js";
import TutorialScene7 from "../tutorial/7-change-transform-in-update/scene.js";
import TutorialScene8 from "../tutorial/8-sound-effect/scene.js";
import TutorialScene9 from "../tutorial/9-particle-effect/scene.js";
import TutorialScene10 from "../tutorial/10-physics-engine/scene.js";
import TutorialScene11 from "../tutorial/11-destroy-object/scene.js";
import TutorialScene12 from "../tutorial/12-change-scene/scene.js";
/**
 * main.js는 index.html에서 명시적으로 불러오고 있다.
 * 따라서 절대 지워서는 안된다.
 *
 * main.js는 게임을 실행하기 위해 기본적인 환경을 설정하는 역할을 한다.
 * init함수에 설정값을 입력하여 엔진을 초기화한다.
 * 이 때 최초로 불러올 씬을 선택하여 게임을 시작한다.
 *
 * 사용자가 직접 설정할 수 있지만, 플레이어에게 맡기는 방법도 있다.
 * Engine.initWithForm()으로 form을 이용해 엔진을 초기화할 수 있다.
 */
window.onload = () => {
  // Engine.init({
  //   width: 1280,
  //   height: 720,
  //   fps: 60,
  //   title: "gameEngineTitle",
  //   scene: ExampleScene
  // });
  Engine.initWithForm({
    thumbnailImagePath: "/favicon.ico",
    title: "gameEngine",
    scene: TutorialScene12
  });
};
