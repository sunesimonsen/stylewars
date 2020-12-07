import insertCss from "./insertCSS.js";
import getContainer from "./getContainer.js";

let counter = 1;
const hashesByContainer = new Map();

function stringToHash(string) {
  var hash = 0;

  let i = string.length;
  while (i) {
    const char = string.charCodeAt(--i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash;
}

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

    const hashString = Math.abs(this._hash).toString(16);
    this._hashString = hashString.match(/^[0-9]/)
      ? `c${hashString}`
      : hashString;
  }

  render() {
    if (typeof this._rendered === "string") {
      return this._rendered;
    }

    let result = "";
    let close = null;
    const tokens = this._content.split(/([:;{}&]|\\?["']|\\)/g).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (close) {
        if (token.match(close)) {
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

  combine(template) {
    const content = this._content + " " + template._content;
    const hash = (629 + this._hash) * 37 + template._hash;
    return new CSSTemplate(content, hash);
  }
}

const hasDocument = () => typeof document !== "undefined";

const appendCSSToDocument = (template) => {
  if (!hasDocument()) return;

  const container = getContainer();

  let hashes = hashesByContainer.get(container);
  const first = !hashes;
  if (first) {
    hashes = new Map();
    hashesByContainer.set(container, hashes);
  }

  if (!hashes.has(template._hash)) {
    insertCss((first ? "" : " ") + template.render());
    hashes.set(template._hash, counter++);
  }
};

export const css = (strings, ...values) => {
  let template = strings[0];

  for (var i = 0; i < values.length; i++) {
    template += String(values[i]);
    template += strings[i + 1];
  }

  return new CSSTemplate(template.replace(/\s*\n+\s*/g, ""));
};

const getInsertionOrder = (template) => {
  const container = getContainer();
  const hashes = hashesByContainer.get(container);

  return hashes && hashes.get(template._hash);
};

const correctlyOrdered = (orders) => {
  if (!hasDocument()) return false;

  let last = orders[0];

  for (let i = 1; i < orders.length; i++) {
    const n = orders[i];

    if (!last && n) return false;
    if (n < last) return false;

    last = n;
  }
  return true;
};

export const classes = (...args) => {
  const values = Array.from(args).filter(Boolean);

  const classNames = values.filter((v) => typeof v === "string");

  const templates = values.filter((v) => v instanceof CSSTemplate);

  const insertionOrders = templates.map(getInsertionOrder);

  if (correctlyOrdered(insertionOrders)) {
    templates.forEach((template, i) => {
      if (!insertionOrders[i]) {
        appendCSSToDocument(template);
      }

      classNames.push(template._hashString);
    });
  } else {
    const template = templates.reduce((combined, template) =>
      combined.combine(template)
    );

    if (!getInsertionOrder(template)) {
      appendCSSToDocument(template);
    }

    classNames.push(template._hashString);
  }

  return classNames.join(" ");
};
