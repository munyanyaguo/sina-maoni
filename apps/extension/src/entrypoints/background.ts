export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    console.warn("Sina Maoni extension installed");
  });
});
