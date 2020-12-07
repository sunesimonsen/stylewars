// Inspired by https://github.com/substack/insert-css
import getStyleElement from "./getStyleElement.js";

export default function insertCss(css) {
  const styleElement = getStyleElement();

  // strip potential UTF-8 BOM if css was read from a file
  if (css.charCodeAt(0) === 0xfeff) {
    css = css.substr(1, css.length);
  }

  // actually add the stylesheet
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText += css;
  } else {
    styleElement.textContent += css;
  }

  return styleElement;
}
