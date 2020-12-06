import insertCss from "insert-css";

let counter = 0;
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
    this.content = content;
    this.hash = hash;
    this._rendered = null;

    const hashString = Math.abs(this.hash).toString(16);
    this.hashString = hashString.match(/^[0-9]/)
      ? `c${hashString}`
      : hashString;
  }

  render() {
    if (typeof this._rendered === "string") {
      return this._rendered;
    }

    let result = "";
    let close = null;
    const tokens = this.content.split(/([:;{}&]|\\?["']|\\)/g).filter(Boolean);

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
        result += `.${this.hashString}`;
      } else {
        result += token;
      }
    }

    this._rendered = result;
    return this._rendered;
  }

  combine(template) {
    const content = this.content + " " + template.content;
    const hash = (629 + this.hash) * 37 + template.hash;
    return new CSSTemplate(content, hash);
  }

  toString() {
    return this.hash;
  }
}

const appendCSSToDocument = (template) => {
  if (typeof document !== "undefined") {
    const container = document.querySelector("head");

    let hashes = hashesByContainer.get(container);
    const first = !hashes;
    if (first) {
      hashes = new Map();
      hashesByContainer.set(container, hashes);
    }

    if (!hashes.has(template.hash)) {
      insertCss((first ? "" : " ") + template.render());
      hashes.set(template.hash, counter++);
    }
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
  const container = document.querySelector("head");
  const hashes = hashesByContainer.get(container);

  return hashes && hashes.get(template.hash);
};

const correctlyOrdered = (orders) => {
  let last = orders[0];
  let lastType = typeof last;

  for (let i = 1; i < orders.length; i++) {
    const n = orders[i];
    const nType = typeof n;

    if (lastType !== "number" && nType === "number") return false;
    if (n < last) return false;

    last = n;
    lastType = nType;
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
      if (typeof insertionOrders[i] !== "number") {
        appendCSSToDocument(template);
      }

      classNames.push(template.hashString);
    });
  } else {
    const template = templates.reduce((combined, template) =>
      combined.combine(template)
    );

    if (typeof getInsertionOrder(template) !== "number") {
      appendCSSToDocument(template);
    }

    classNames.push(template.hashString);
  }

  return classNames.join(" ");
};
