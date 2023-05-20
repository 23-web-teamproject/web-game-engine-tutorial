/** @function
 * value를 min, max의 범위 내로 강제한다.
 *
 * @param {number} value - 범위 내로 강제할 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} 최소값과 최대값 사이의 값
 */
const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
};

/**
 * value의 타입이 Type이라면 value를 그대로 반환하고,
 * 그렇지 않으면 defaultValue를 반환한다.
 *
 * @function typeCheck
 * @param {any} value - 타입 검사의 대상
 * @param {any} Type - 지정된 타입
 * @param {any} defaultValue - value의 타입이 Type이 아닐 때 반환될 기본값
 * @returns {any} value 또는 defaultValue
 */
const typeCheck = (value, Type, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof Type === "function") {
    if (value instanceof Type) {
      return value;
    } else {
      return defaultValue;
    }
  } else {
    if (typeof value === Type) {
      return value;
    } else {
      return defaultValue;
    }
  }
};

/**
 * value의 타입이 number라면 min과 max사이로 값을 강제하고,
 * 그렇지 않으면 defaultValue를 반환한다.
 *
 * @function typeCheckAndClamp
 * @param {any} value - 타입 검사의 대상
 * @param {number} Type - 지정된 타입
 * @param {number} defaultValue - value의 타입이 Type이 아닐 때 반환될 기본값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} clamp된 value 또는 defaultValue
 */
const typeCheckAndClamp = (value, Type, defaultValue, min, max) => {
  const typeCheckedValue = typeCheck(value, Type, defaultValue);
  return clamp(typeCheckedValue, min, max);
};

/**
 * 주어진 객체가 갖고 있는 프로퍼티중에
 * value를 값으로 갖는 키를 반환한다.
 *
 * @function findKeyInObjectWithValue
 * @param {object} object - 프로퍼티를 조사할 객체
 * @param {object} value - 찾으려는 객체
 * @returns {string} value를 값으로 갖는 키
 */
const findKeyInObjectWithValue = (object, value) => {
  return Object.keys(object).find((key) => {
    return object[key] === value;
  });
};

/**
 * 발생한 에러 메시지의 스택을 document에 출력한다.
 *
 * @param {string} error
 */
const writeErrorMessageOnDocument = (error) => {
  const errorStackString = error.stack;
  const splitedErrorMsg = errorStackString.split("    ");

  let errorMessage = `<h3 class="error-msg">⚠️ ${splitedErrorMsg[0]}</h3>`;
  for (let i = 1; i < splitedErrorMsg.length; i++) {
    errorMessage += `<h3 class="error-msg">... ${splitedErrorMsg[i]}</h3>`;
  }

  const errorMessageDiv = document.createElement("div");
  errorMessageDiv.id = "error-msg-container";
  errorMessageDiv.innerHTML = errorMessage;

  document.body.appendChild(errorMessageDiv);

  console.error(error);
};

export {
  clamp,
  typeCheck,
  typeCheckAndClamp,
  findKeyInObjectWithValue,
  writeErrorMessageOnDocument,
};
