import insertCss from "insert-css";

const hashesByContainer = new Map();

function stringToHash(string) {
  var hash = 0;

  if (string.length === 0) return hash;

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
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
    let hash = 17;
    hash = hash * 37 + this.hash;
    hash = hash * 37 + template.hash;
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
      hashes = new Set();
      hashesByContainer.set(container, hashes);
    }

    if (!hashes.has(template.hash)) {
      insertCss((first ? "" : " ") + template.render());
      hashes.add(template.hash);
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

export const classes = (...args) => {
  const values = Array.from(args).filter(Boolean);

  const classNames = values.filter((v) => typeof v === "string");

  const templates = values.filter((v) => v instanceof CSSTemplate);

  if (templates.length > 0) {
    const template = templates.reduce((combined, template) =>
      combined.combine(template)
    );

    appendCSSToDocument(template);

    classNames.push(template.hashString);
  }

  return classNames.join(" ");
};
