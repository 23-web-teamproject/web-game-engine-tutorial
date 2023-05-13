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
  fpsList = await getAvailableFpsList();
  resolutionList = getAvailableResolution();

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
      isMobileDevice: option["mobile"] || false,
    };
  };

  const div = document.createElement("div");
  div.id="form-container";
  
  const thumbnailImage = new Image();
  thumbnailImage.src = imagePath;
  div.append(thumbnailImage);

  const form = document.createElement("form");
  form.id = "init-form";
  form.action = "javascript:void(0)";
  form.onsubmit = (event) => {
    const formdata = getFormData(event);
    callback(formdata);
    document.getElementById("form-container").remove();
    return false;
  };
  form.innerHTML = `
<label>
  Resolution :
  <select name="resolution">
    ${resolutionList.reduce((optionElement, item, index) => {
      optionElement += `
        <option value="${index}" ${
        index + 1 === resolutionList.length ? "selected" : ""
      }>${item.description}</option>
      `;
      return optionElement;
    }, new String())}
  </select>
</label>
<label>
  Framelate :
  <select name="framelate">
    ${fpsList.reduce((optionElement, item, index) => {
      optionElement += `
        <option value="${index}" ${
        index + 1 === fpsList.length ? "selected" : ""
      }>${item.description}</option>
      `;
      return optionElement;
    }, new String())}
  </select>
</label>
<label>
  Mobile :
  <input type="checkbox" name="mobile" />
</label>
<input type="submit" value="Ok">`;

  div.append(form);
  document.body.append(div);
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

export default makeForm;
