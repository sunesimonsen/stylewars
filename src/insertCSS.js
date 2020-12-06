// A trimmed version of https://github.com/substack/insert-css
import getContainer from "./getContainer.js";

const styleElements = new Map();

function createStyleElement() {
  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  return styleElement;
}

export default function insertCss(css) {
  const container = getContainer();

  let styleElement = styleElements.get(container);

  // first time we see this container, create the necessary entries
  if (!styleElement) {
    styleElement = createStyleElement();
    container.appendChild(styleElement);
    styleElements.set(container, styleElement);
  }

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
