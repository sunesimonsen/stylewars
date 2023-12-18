const id = "stylewars";

const getDocument = () => typeof document !== "undefined" && document;

const getStyleElement = () => {
  let styleElement = getDocument().getElementById(id);

  if (styleElement) return styleElement;

  styleElement = getDocument().createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.setAttribute("id", id);
  styleElement._hashes = new Map();
  styleElement._positions = new Map();
  styleElement._counter = 1;
  getDocument().head.appendChild(styleElement);

  return styleElement;
};

// Inspired by https://github.com/substack/insert-css
const insertCss = (css) => {
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
};

function stringToHash(string) {
  let hash = 0;

  let i = string.length;
  while (i) {
    const char = string.charCodeAt(--i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash;
}

const getHashes = () => getStyleElement()._hashes;
const getPositions = () => getStyleElement()._positions;

const pairs = {
  '"': '"',
  "'": "'",
  "{": "}",
};

class CSSTemplate {
  constructor(content, hash = stringToHash(content)) {
    this._content = content;
    this._hash = hash;
    this._rendered = null;
  }

  get _hashString() {
    if (!this.cachedHashString) {
      const hashes = getHashes();

      while (
        hashes.has(this._hash) &&
        hashes.get(this._hash) !== this._content
      ) {
        this._hash++;
      }

      if (!hashes.has(this._hash)) {
        hashes.set(this._hash, this._content);
      }

      const hashString = Math.abs(this._hash).toString(16);
      this._cachedHashString = hashString.match(/^[0-9]/)
        ? `c${hashString}`
        : hashString;
    }

    return this._cachedHashString;
  }

  _render() {
    if (typeof this._rendered === "string") {
      return this._rendered;
    }

    let result = "";
    let close = null;
    const tokens = this._content
      .split(/(&\([^)]+\)|[:;{}&]|\\?["']|\\)/g)
      .filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.startsWith("&(") && token.endsWith(")")) {
        result += `${this._hashString}-${token.slice(2, -1)}`;
        continue;
      }

      if (close) {
        if (token === close) {
          close = null;
        }
        result += token;
        continue;
      }

      close = pairs[token];

      if (close) {
        result += token;
      } else if (token === "&") {
        result += `.${this._hashString}`;
      } else {
        result += token;
      }
    }

    this._rendered = result;
    return this._rendered;
  }

  _combine(template) {
    const content = this._content + " " + template._content;
    const hash = (629 + this._hash) * 37 + template._hash;
    return new CSSTemplate(content, hash);
  }

  toString() {
    return renderCSS([this]);
  }
}

const appendCSSToDocument = (template) => {
  if (!getDocument()) return;

  const positions = getPositions();

  if (!positions.has(template._hash)) {
    insertCss(template._render());
    positions.set(template._hash, getStyleElement()._counter++);
  }
};

export const css = (strings, ...values) => {
  let template = strings[0];

  for (let i = 0; i < values.length; i++) {
    template += String(values[i]);
    template += strings[i + 1];
  }

  return new CSSTemplate(template.replace(/\s*\n+\s*/g, ""));
};

const getPosition = (template) => {
  const positions = getPositions();

  return positions.get(template._hash);
};

const correctlyOrdered = (positions) => {
  if (!getDocument()) return false;

  let last = positions[0];

  for (let i = 1; i < positions.length; i++) {
    const n = positions[i];

    if (!last && n) return false;
    if (n < last) return false;

    last = n;
  }
  return true;
};

class CSSClasses {
  constructor(classes) {
    this._classes = classes;
  }

  _getClasses() {
    const classes = [];

    this._classes.forEach((v) => {
      if (v instanceof CSSClasses) {
        classes.push(...v._getClasses());
      } else {
        classes.push(v);
      }
    });

    return classes;
  }

  toString() {
    return renderCSS(this._getClasses());
  }
}

export const classes = (...args) => {
  return new CSSClasses(Array.from(args));
};

const renderCSS = (classes) => {
  const values = classes.filter(Boolean);

  const classNames = values.filter((v) => typeof v === "string");
  const templates = values.filter((v) => v instanceof CSSTemplate);

  const positions = templates.map(getPosition);

  if (correctlyOrdered(positions)) {
    templates.forEach((template, i) => {
      if (!positions[i]) {
        appendCSSToDocument(template);
      }

      classNames.push(template._hashString);
    });
  } else {
    const template = templates.reduce((combined, template) =>
      combined._combine(template),
    );

    if (!getPosition(template)) {
      appendCSSToDocument(template);
    }

    classNames.push(template._hashString);
  }

  return classNames.join(" ");
};
