const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
}

const typeCheck = (value, Type, defaultValue) => {
  if(typeof Type === "object") {
    if(value instanceof Type) {
      return value;
    } else {
      return defaultValue;
    }
  } else {
    if(typeof value === Type) {
      return value;
    } else {
      return defaultValue;
    }
  }
}

const typeCheckAndClamp = (value, Type, defaultValue, min, max) => {
  const typeCheckedValue = typeCheck(value, Type, defaultValue);
  return clamp(typeCheckedValue, min, max);
}

export {
  clamp,
  typeCheck,
  typeCheckAndClamp
};
