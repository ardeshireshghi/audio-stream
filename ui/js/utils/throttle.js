const throttle = (fn, delay = 1000) => {
  let shouldCall = true;
  return (...args) => {
    if (shouldCall) {
      fn(...args);
      shouldCall = false;
      setTimeout(() => {
        shouldCall = true;
      }, delay);
    }
  };
};
