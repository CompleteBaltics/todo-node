let toBeA = (recieved, arg) => {
  if (arg === typeof recieved) {
    return {
      message: () =>
        `expected received arguments to be type of ${arg}`,
      pass: true,
    };
  } else {
    return {
      message: () => `expected received arguments to be type of ${arg}, but they are ${typeof recieved}`,
      pass: false,
    };
  }
};

module.exports = {
  toBeA
};
