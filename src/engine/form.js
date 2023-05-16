let fpsList;
let resolutionList;

/**
 * 해상도와 fps, 실행할 디바이스를 선택할 수 있는 form을 생성한다.
 * 플레이어가 submit할 경우 인자로 전달된 콜백함수를 실행한다.
 * 콜백함수가 실행된 뒤엔 body에 등록된 form을 제거한다.
 *
 * @function
 * @async
 * @param {function} callback - form에 submit된 데이터로 초기화를 진행하는 콜백함수
 */
const makeForm = async (imagePath, callback) => {
  // form에 입력된 데이터를 추출할 함수다.
  const getFormData = (event) => {
    const formData = new FormData(event.target);
    const option = new Object();
    for (const [key, value] of formData.entries()) {
      option[key] = value;
    }
    return {
      width: resolutionList[option["resolution"]].width,
      height: resolutionList[option["resolution"]].height,
      fps: fpsList[option["framelate"]].fps,
    };
  };

  // form과 썸네일을 감쌀 div태그를 만든다.
  const div = document.createElement("div");
  div.id = "form-container";

  // 썸네일 이미지를 생성한다.
  const thumbnailImage = new Image();
  thumbnailImage.src = imagePath;
  div.append(thumbnailImage);

  // form을 생성한다.
  const form = document.createElement("form");
  form.id = "init-form";
  form.action = "javascript:void(0)";

  // form에 submit 이벤트가 발생하면 데이터를 추출해 콜백함수에 넘겨주고
  // div#form-container를 지운다.
  form.onsubmit = (event) => {
    const formdata = getFormData(event);
    callback(formdata);
    document.getElementById("form-container").remove();
    return false;
  };

  // form을 구성한다.
  form.append(createLabel("Resolution"));
  form.append(createSelect("resolution"));
  form.append(createLabel("Framelate"));
  form.append(createSelect("framelate"));
  form.append(createLabel("　"));
  form.append(createSubmitButton());

  // document에 생성한 element들을 등록한다.
  div.append(form);
  document.body.append(div);

  // fps와 해상도 리스트를 가져온다.
  await getAvailableFpsAndResolution();

  // 가져온 해상도 리스트와 fps리스트로 option을 생성한다.
  createOptions();
};

const createLabel = (content) => {
  const label = document.createElement("label");
  label.innerText = content;
  return label;
};

const createSelect = (name) => {
  const select = document.createElement("select");
  select.className = "input";
  select.name = name;
  return select;
};

const createSubmitButton = () => {
  const button = document.createElement("input");
  button.className = "input";
  button.type = "submit";
  button.value = "Ok";
  return button;
};

/**
 * 현재 모니터의 해상도에 따라 적용 가능한 해상도와 fps를 가져온다.
 *
 * @function
 * @async
 */
const getAvailableFpsAndResolution = async () => {
  fpsList = await getAvailableFpsList();
  resolutionList = getAvailableResolution();
};

/**
 * 현재 모니터의 해상도에 따라 적용 가능한 해상도들을 리스트로 반환한다.
 *
 * @function
 * @returns {array}
 */
const getAvailableResolution = () => {
  const resolutionList = [
    { description: "800 x 600 (4:3)", width: 800, height: 600 },
    { description: "1024 x 768 (4:3)", width: 1024, height: 768 },
    { description: "1280 x 720 (16:9)", width: 1280, height: 720 },
    { description: "1280 x 1024 (4:3)", width: 1280, height: 1024 },
    { description: "1366 x 768 (16:9)", width: 1366, height: 768 },
    { description: "1600 x 900 (16:9)", width: 1600, height: 900 },
    { description: "1680 x 1050 (4:3)", width: 1680, height: 1050 },
    { description: "1920 x 1080 (16:9)", width: 1920, height: 1080 },
    { description: "2560 x 1440 (16:9)", width: 2560, height: 1440 },
    { description: "3840 x 2160 (16:9)", width: 3840, height: 2160 },
  ];
  const availableWidth = window.screen.availWidth;
  const availableHeight = window.screen.availHeight;
  return resolutionList.reduce((availableResolutionList, item) => {
    if (item.width <= availableWidth && item.height <= availableHeight) {
      availableResolutionList.push(item);
    }
    return availableResolutionList;
  }, new Array());
};

/**
 * 현재 모니터의 fps에 따라 가능한 fps들을 리스트로 반환한다.
 *
 * @function
 * @returns {array}
 */
const getAvailableFpsList = async () => {
  const fpsList = [
    { description: "30", fps: 29 },
    { description: "60", fps: 59 },
    { description: "120", fps: 119 },
    { description: "144", fps: 143 },
    { description: "165", fps: 164 },
    { description: "240", fps: 239 },
  ];
  const monitorFps = await getCurrentFps();

  return fpsList.reduce((availableFpsList, item) => {
    if (item.fps <= monitorFps) {
      availableFpsList.push(item);
    }
    return availableFpsList;
  }, new Array());
};

/**
 * requestAnimationFrame를 두 번 실행시켜 deltaTime을 구한 후
 * 그 값으로 모니터의 fps를 계산해 반환한다.
 *
 * @function
 * @returns {Promise<number>}
 */
const getCurrentFps = () => {
  return new Promise((resolve) => {
    requestAnimationFrame((t1) => {
      requestAnimationFrame((t2) => {
        resolve(1000 / (t2 - t1));
      });
    });
  });
};

const createOptions = () => {
  const resolutionSelect = document.getElementsByName("resolution")[0];

  resolutionList.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.innerText = item.description;
    if (index + 1 === resolutionList.length) {
      option.setAttribute("selected", true);
    }
    resolutionSelect.append(option);
  });

  const fpsSelect = document.getElementsByName("framelate")[0];

  fpsList.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.innerText = item.description;
    if (index + 1 === fpsList.length) {
      option.setAttribute("selected", true);
    }
    fpsSelect.append(option);
  });
};

export default makeForm;
