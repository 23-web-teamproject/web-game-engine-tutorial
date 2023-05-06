const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
}

const typeCheck = (value, Type, defaultValue) => {
  if(value === undefined) {
    return defaultValue;
  }

  if(typeof Type === "function") {
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

const findKeyInObjectWithValue = (object, value) => {
  return Object.keys(object).find(key => {
    return object[key] === value;
  });
}

export {
  clamp,
  typeCheck,
  typeCheckAndClamp,
  findKeyInObjectWithValue
};
