const puppeteer = require("puppeteer-extra");
const datefns = require("date-fns");
const pluginStealth = require("puppeteer-extra-plugin-stealth");

const { exec } = require("child_process");
const { executablePath } = require("puppeteer");
const anonymizeUaPlugin = require("puppeteer-extra-plugin-anonymize-ua");
const {
  getRandomArbitrary,
  millisToMinutesAndSeconds,
  delay,
  logStep,
} = require("./utils");

// SET HERE YOUR CONFIG
const DEFAULT_POOL_DELAY_IN_MS = 60000 * 5; // 1min * X
const MAX_RETRY = 100;
const MONTH = "November";
const INPUT_ID = "1-0-d-day-29";

// Use stealth
puppeteer.use(pluginStealth());
// Use anonymize
puppeteer.use(anonymizeUaPlugin());

const isDateAvailableToBuy = async (page) => {
  try {
    await page.goto("https://ticket.toureiffel.paris/en");

    const acceptCookies = await page.$("button#tarteaucitronPersonalize2");
    acceptCookies.evaluate((button) => button.click());

    let shouldGoNextMonth = true;
    while (shouldGoNextMonth) {
      await page.waitForSelector("span.d-year");
      const isRightMonth = await page.evaluate((month) => {
        const currentMonth = document.querySelector("span.d-month");
        return currentMonth ? currentMonth.innerHTML === month : false;
      }, MONTH);
      if (isRightMonth) break;
      await page.click("button#d-next");
      if (isRightMonth) break;
      shouldGoNextMonth = !isRightMonth;
    }

    const isDayAvailable = await page.evaluate(() => {
      const dayButtonElement = document.getElementById(INPUT_ID);
      if (!dayButtonElement) return false;
      return !dayButtonElement.disabled;
    });

    return isDayAvailable;
  } catch (err) {
    return false;
  }
};

(async () => {
  try {
    let retry = 1;
    const browser = await puppeteer.launch({
      executablePath: executablePath(),
      args: ["--no-sandbox"],
      headless: true,
      slowMo: 250,
    });
    const [page] = await browser.pages();
    while (retry < MAX_RETRY) {
      logStep(
        `[${retry}/${MAX_RETRY}] - Starting process at ${datefns.format(
          new Date(),
          "dd/MM/yyyy - HH:mm:ss"
        )}`
      );
      const shouldStop = await isDateAvailableToBuy(page);
      if (shouldStop) {
        retry = MAX_RETRY + 1;
      } else {
        const nextPoll = DEFAULT_POOL_DELAY_IN_MS * getRandomArbitrary();
        logStep(
          `[${retry}/${MAX_RETRY}] - Next try in ${millisToMinutesAndSeconds(
            nextPoll
          )}m`
        );
        retry++;
        await delay(nextPoll);
      }
    }

    exec("afplay ./alert.mp3");

    return;
  } catch (err) {
    console.error(err);
  }
})();
