const moment = require("moment");

const gernerateMessage = (from, text) => {
  return {
    from,
    text,
    // createAt: new Date().getTime(),
    createAt: moment().valueOf(),
  };
};

const gernerateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    createAt: moment().valueOf(),
  };
};

module.exports = {
  gernerateMessage,
  gernerateLocationMessage,
};
