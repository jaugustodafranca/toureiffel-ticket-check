const getRandomArbitrary = () => {
  return Math.random() * (1.25 - 0.75) + 0.75;
};

const millisToMinutesAndSeconds = (millis) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + "m " + (seconds < 10 ? "0" : "") + seconds + "s";
};

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

const logStep = (stepTitle) => {
  console.log("=====>>> ", stepTitle);
};

module.exports = {
  getRandomArbitrary,
  millisToMinutesAndSeconds,
  delay,
  logStep,
};
