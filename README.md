# Web Game Engine Tutorial

![JavaScript](https://img.shields.io/badge/javascript-white.svg?style=flat-square&logo=javascript&logoColor=%23F7DF1E)

# Introduction

웹게임 프레임워크의 여러가지 튜토리얼입니다.

웹게임 프레임워크 0.6버전을 사용하여 제작되었습니다.

`main.js`의 `scene` 속성을 import된 다른 객체로 변경하여 예제를 실행하면 됩니다.

# Tutorial

이 엔진에 대한 예제는 [튜토리얼 레포지토리](https://github.com/23-web-teamproject/web-game-engine-tutorial)에 있습니다.

# Index

1. [엔진 초기화 및 씬 생성](#1-엔진-초기화-및-씬-생성)
2. [씬 내부에서 객체 생성 및 등록](#2-씬-내부에서-객체-생성-및-등록)
3. [InputManager를 이용한 입력 받기](#3-inputmanager를-이용한-입력-받기)
4. [Rect, Circle](#4-rect-circle)
5. [Text](#5-text)
6. [Sprite](#6-sprite)
7. [Update를 활용한 객체 이동 및 회전](#7-update를-활용한-객체-이동-및-회전)
8. [SoundEffect](#8-soundeffect)
9. [ParticleEffect](#9-particleeffect)
10. [물리 효과](#10-물리-효과)

# 1. 엔진 초기화 및 씬 생성

## 엔진 초기화

엔진 초기화는 `main.js`부터 시작됩니다.

```js
// main.js
Engine.init({
  width:    // 게임 화면의 가로 크기
  height:   // 게임 화면의 세로 크기
  fps:      // 프레임 수
  scene:    // 최초로 실행될 씬
});
```

`main.js`는 `index.html`에서 불러오고 있기 때문에 삭제되면 안됩니다.

위에 정의된 속성은 초기화 단계에서 활용됩니다.

## 씬 생성

씬 객체를 생성하려면 별도의 파일을 생성한다음 그 파일 내에서 `GameObject`를 상속받은 객체를 작성하면 됩니다.

```js
// tutorial/1-engine-initialization/scene.js

import { GameObject } from "/src/engine/module.js";

export default class TutorialScene1 extends GameObject {
  constructor() {
    super();
  }
}
```

> `import`는 다른 파일에서 정의된 모듈(또는 클래스)을 불러오고, `export`는 다른 파일에서 활용할 수 있도록 현재 파일에 정의되어 있는 여러 모듈을 내보내는 기능입니다.
>
> 이에 대한 자세한 설명은 [이 게시글](https://ko.javascript.info/import-export)을 참고하면 됩니다.

`class`로 클래스를 생성한다음 `extends`를 통해 `GameObject`를 상속받은 객체를 만들었습니다. 이 객체는 씬 객체로 사용하기로 했으니 이름을 `TutorialScene1`이라 했습니다.

> :warning: `GameObject`를 상속받았다면 **`constructor()`에서 항상 `super()`를 제일 먼저 호출해주어야 합니다.** 그렇지 않을 경우 씬 객체 내에서 `this`를 사용할 수 없습니다.

이렇게 씬 생성을 마치고 `Engine.init()`에서 씬을 등록했다면 정상적으로 초기화가 되고 TutorialScene1이 보여지게 됩니다.

# 2. 씬 내부에서 객체 생성 및 등록

씬 내부에서 객체를 생성하려면 먼저 생성하려는 객체를 불러오거나, 같은 파일에서 객체 클래스를 정의한 다음 씬의 생성자에서 `this`키워드를 활용해 등록하면 됩니다.

```js
// in constructor
constructor() {
  this.newObject = //생성할 객체 ex. new GameObject();
}
```

만약 `GameObject`를 상속받은 객체를 생성하려고 할 때 내부 속성을 변경하고 싶다면 생성자에게 속성 객체를 전달하면 됩니다.

```js
// in constructor
constructor() {
  this.newObject = new GameObject({ // 속성 객체를 정의함과 동시에 생성자 함수의 인자로 넘겨주면 바로 초기화가 됩니다.
    transform: {
      position: new Vector(200, 100)
    }
  });
}
```

## GameObject의 속성

부모 객체를 상속받는 모든 자식 객체는 생성자에서 `super()`를 필수적으로 호출해야합니다.

따라서 `GameObject`를 상속받는 모든 객체들도 결과적으로 `GameObject`의 생성자를 호출하게 되는데, 이 때 `GameObject`의 속성을 설정할 수 있습니다.

객체를 생성할 때 속성 객체를 이용해 초기화를 하게되면 이 속성 객체가 `super(options)`으로 인해 `GameObject`에게도 전달되어 최종적으로 `GameObject`의 속성도 초기화됩니다.

| 속성            | 설명                                               |
| --------------- | -------------------------------------------------- |
| rigidbody       | 물리 효과를 위한 [강체](#10-물리-효과)를 말합니다. |
| transform       | 좌표, 회전, 규모를 저장하는 객체입니다.            |
| isPhysicsEnable | 물리 효과를 적용할 것인지를 의미합니다.            |
| color           | 이 객체의 색상입니다.                              |

### Transform

물체의 좌표, 회전각도, 규모를 갖고 있는 객체입니다.

|속성|설명|
|---|---|
|position|xy좌표를 말합니다.|
|rotation|회전각(degree)를 말합니다.|
|scale|물체의 규모를 의미합니다. 만약 100x100크기의 물체의 scale이 (2,1)라면 화면에 나타나는 물체의 크기는 200x100이 됩니다.|

# 3. InputManager를 이용한 입력 받기

## 키의 상태

키의 상태에 대해서는 `input-manager.js`의 주석에 자세히 적어놓았습니다.

간단하게 설명하면 아래와 같습니다.

| 키 상태        | 설명                  |
| -------------- | --------------------- |
| `KEY_UP`       | 키를 누르지 않은 상태 |
| `KEY_DOWN`     | 키를 처음 누른 상태   |
| `KEY_PRESSED`  | 키를 누르고 있는 상태 |
| `KEY_RELEASED` | 키를 막 뗀 상태       |

이 예제에서는 개발자 도구를 열어서 키를 눌렀을 때 상태를 어떻게 감지할 수 있는지 볼 수 있습니다.

`isKeyDown`, `isKeyReleased` ... 와 같은 함수에 키의 이름을 넘겨서 확인할 수 있습니다.

`InputManager`는 이벤트 리스너를 통해 키의 상태를 조회하므로, 키의 종류는 [공식문서](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)에서 확인할 수 있습니다.

:warning: 주의할 점은 스페이스 바는 `" "`로 취급되기 때문에 `spacebar`나 `space`로 조회하면 안됩니다.

# 4. Rect, Circle

사각형과 원 객체는 `rect.js`와 `circle.js`에 구현되어 있습니다.

기본적으로 `GameObject`를 상속받고 있어 씬에 등록되기만 한다면 자동으로 화면에 그려집니다.

## Rect

가로(width), 세로(height) 길이를 필수로 정의해야하는 `GameObject`입니다.

사각형 내부를 칠하기 위해 `color` 속성을 변경할 수 있고 윤곽선 색상과 두께도 설정하여 그릴 수 있습니다.

## Circle

원은 반지름을 필수로 정의해야하는 `GameObject`압니다.

원도 사각형과 마찬가지로 윤곽선 색상과 두께를 설정할 수 있습니다.

# 5. Text

문자열을 화면에 출력하고 싶다면 `Text`객체를 이용하면 됩니다.

html에서 글자의 속성으로는 `fontSize`, `color`, `line-height`, `font-family`와 같은 속성들이 있습니다.

이 속성들은 `Text`를 생성할 때 옵션에서 변경할 수 있습니다. 예제에 더 자세히 설명되어있습니다.

만약 웹폰트를 CDN으로 받아와 사용하고 싶다면 `style.css`에서 `import`하거나 `<head>`에서 불러온 후 `setFont()`의 인자로 폰트의 이름을 넘겨주면 됩니다.

만약 `setFontSize()`를 통해 글자 크기를 변경했다면 자동으로 줄 간격이 설정됩니다. 이 때 설정되는 줄 간격의 값은 `글자 크기 * 1.25`입니다.

문자열에 줄바꿈이 필요하다면 C언어에서 `printf("\n")`을 썼던 것처럼 문자열에 `\n`을 넣으면 됩니다.

# 6. Sprite

사각형이나 원, 문자열이 아닌 이미지를 보이게 하고 싶다면 `Sprite`객체를 이용하면 됩니다.

생성자에서 이미지 파일의 경로를 전달하면 자동으로 이미지를 가진 `GameObject`가 생성됩니다.

## 이미지의 경로

이 때 이미지의 경로를 절대경로로 설정했다면 별다른 설정을 하지 않아도 되지만, 상대경로로 설정하고 싶다면 `Path`객체를 이용해야 합니다.

> :warning: JS에서는 사용자의 로컬 폴더를 헤집을 수 있는 기능이 없습니다. 보안상의 이유로 제공해주지 않습니다.
> 따라서 사용자가 직접 로컬 폴더를 지정하는 기능을 만들어야 합니다. 여기선 `Path`객체가 그 역할을 담당합니다.

`Path.setAssetFolderPath()`함수를 통해 상대경로의 루트가 되는 폴더를 지정할 수 있습니다.

이 함수를 실행하게 되면 절대경로가 아닌 모든 경로는 위 함수를 통해 설정한 폴더를 루트로 가지게 됩니다.

```
// folder structure

src/
`-- asset/
    +-- image1.png
    `-- folder/
        `-- image2.png
```

```js
// in constructor
constructor() {
  Path.setAssetFolderPath("/src/asset/"); // 상대경로로 이미지를 불러오려면 Path객체를 반드시 사용해야합니다.
  this.image1 = new Image({
    imagePath: "image1.png", // ok
  });
  this.image2 = new Image({
    imagePath: "folder/image2.png", // ok
  });

  // Path객체를 사용하지 않아도 절대경로를 사용할 수 있습니다.
  this.image3 = new Image({
    imagePath: "/src/asset/folder/image2.png", // ok
  });
}
```

만약 현재 파일의 위치를 상대경로의 루트 폴더로 사용하고 싶다면, `import.meta.url`을 사용하면 됩니다.

```
src/
`-- scene/
    `-- folder1/
        `-- folder2/
            `-- folder3/
                +-- scene.js
                `-- image.png
```

```js
// in scene.js
constructor(){
  Path.setAssetFolderPath(import.meta.url); // import.meta.url은 현재 파일의 절대경로를 의미합니다.
  this.image = new Image({
    imagePath: "image.png", // ok
  });
}
```

위 폴더 구조에서 scene.js가 위치한 폴더는 깊이가 매우 깊기 때문에 import.meta.url로 간단히 나타낼 수 있습니다.

# 7. Update를 활용한 객체 이동 및 회전

원본 레포지토리의 README에서 [엔진 파이프라인 항목](https://github.com/23-web-teamproject/web-game-engine#4-update-game-logic)에는 매 프레임마다 게임 로직을 실행한다고 되어있습니다.

구체적으로는 **매 프레임마다 씬 객체의 `Update()`를 실행함으로** 게임 로직이 업데이트됩니다.

따라서 씬 객체의 `Update()`함수에 게임이 어떻게 동작할 것인지를 정의하면 게임이 굴러가게 되는 것입니다.

그러므로 사용자는 `Update()`에 구체적인 게임 시스템을 구축하여야 합니다.

이 예제에서는 씬 객체의 자식들의 위치를 변경하고, 다른 파일에서 정의된 객체를 불러오고 있습니다.

다른 파일에 정의된 객체 또한 `GameObject`를 상속받고 씬의 자식이기 때문에 `Update()`가 실행되게 됩니다.

이 개념을 잘 이해하면 캐릭터나 적, 총알 같이 **_독립된 하나의 오브젝트를 각 파일로 나눠 구현할 수 있습니다._**

# 8. SoundEffect

사운드파일을 재생하려면 `SoundEffect`객체를 사용하면 됩니다.

사운드파일을 재생/일시정지/정지하는 기능만 담고 있습니다.

중요한 점은 각 사운드파일별로 음량이 설정되어 있습니다. 전체 음량을 설정하는 기능은 제공하지 않고 있습니다.

# 9. ParticleEffect

마인크래프트의 횃불을 보면 연기 이미지가 생성되었다가 사라집니다. 이 효과가 파티클 이펙트입니다.

![minecraft torch](https://media.tenor.com/-J8-NvMyKtsAAAAi/torch-minecraft.gif)

파티클 이펙트를 사용하려면 `ParticleEffect`객체를 사용하면 됩니다.

## ParticleEffect의 속성

| 속성           | 설명                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| isEnable       | 파티클효과를 실행할지를 말합니다.                                                                             |
| isScaleFade    | 크기가 줄어드는 효과를 적용할 것인지를 말합니다.                                                              |
| isAlphaFade    | 점점 투명해지는 효과를 적용할 것인지를 말합니다.                                                              |
| countPerSecond | 1초에 파티클 몇 개를 생성할 것인지를 말합니다.                                                                |
| direction      | 파티클의 진행방향(degree)을 의미합니다.                                                                       |
| diffuseness    | 파티클의 퍼짐 정도를 의미합니다. 만약 direction이 30이고 diffuseness가 15라면 최종 방향은 15 ~ 45도가 됩니다. |
| speed          | 파티클의 이동 속력을 의미합니다.                                                                              |
| lifeTime       | 파티클의 지속시간을 의미합니다.                                                                               |

# 10. 물리 효과

엔진 파이프라인에서 [Update Physics](https://github.com/23-web-teamproject/web-game-engine#5-update-physics)항목을 참고하면, 물리효과가 켜진 객체만 수집하여 따로 물리효과를 처리한다고 되어 있습니다.

`GameObject`를 생성할 때 `isPhysicsEnable: true`속성을 추가하면 물리 효과가 적용됩니다.

```js
// in constructor
this.physicsEnabledObject = new GameObject({
  isPhysicsEnable: true,
  rigidbody: {
    isGravity: true,
  },
});
```

## Rigidbody

물리 효과에서 객체는 `rigidbody`(강체)로 나타내어집니다.

강체는 여러가지 속성을 갖고 있어 상호작용이 일어날 때 그 값을 이용해 반작용의 계수를 결정하게 됩니다.

| 속성            | 설명                                                            |
| --------------- | --------------------------------------------------------------- |
| mass            | 물체의 질량을 의미합니다.                                       |
| bounceness      | 물체의  계수를 의미합니다. 이 값이 클수록 통통 튀게 됩니다. |
| staticFriction  | 정지 마찰 계수를 의미합니다.                                    |
| dynamicFriction | 운동 마찰 계수를 의미합니다.                                    |
| isStatic        | `true`라면 물리 효과는 적용되지만 고정된 좌표를 갖습니다.       |
| isGravity       | `true`라면 중력가속도가 적용됩니다.                             |

만약 땅처럼 절대 움직이지 않지만 물리 효과가 적용되어야 할 때는 `isStatic: true`여야 합니다.
