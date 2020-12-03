const insertCss = require("insert-css");
const deindent = require("@gustavnikolaj/string-utils/deindent");

const hashesByContainer = new Map();

function stringToHash(string) {
  var hash = 0;

  if (string.length == 0) return hash;

  for (i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hashString = Math.abs(hash).toString(16);
  return hashString.match(/^[0-9]/) ? `c${hashString}` : hashString;
}

class CSSRules {
  constructor(templateString) {
    this.template = templateString;
    this.hash = stringToHash(this.template);
    this.content = this.template.replace(/\&/g, `.${this.hash}`);
  }

  toString() {
    return this.hash;
  }
}

class CSSTemplate {
  constructor(content) {
    this.content = deindent(content);
  }

  toString() {
    return this.content;
  }
}

const appendCSSRules = (cssRules) => {
  if (typeof document !== "undefined") {
    const container = document.querySelector("head");

    let hashes = hashesByContainer.get(container);
    const first = !hashes;
    if (first) {
      hashes = new Set();
      hashesByContainer.set(container, hashes);
    }

    if (!hashes.has(cssRules.hash)) {
      insertCss((first ? "" : "\n") + cssRules.content);
      hashes.add(cssRules.hash);
    }
  }
};

const css = (strings, ...values) => {
  let template = strings[0];

  for (var i = 0; i < values.length; i++) {
    template += String(values[i]);
    template += strings[i + 1];
  }

  return new CSSTemplate(template);
};

const classes = (...args) => {
  const values = Array.from(args).filter(Boolean);

  const classNames = values.filter((v) => typeof v === "string");

  const template = values.filter((v) => v instanceof CSSTemplate).join("\n");

  const cssRules = new CSSRules(template);

  appendCSSRules(cssRules);

  classNames.push(cssRules.hash);

  return classNames.join(" ");
};

module.exports = { css, classes };
