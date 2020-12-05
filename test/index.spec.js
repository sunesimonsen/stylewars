const expect = require("unexpected")
  .clone()
  .use(require("unexpected-dom"))
  .use(require("unexpected-snapshot"))
  .use(require("magicpen-prism"))
  .addAssertion(
    "<DOMDocument> to have CSS satisfying <assertion>",
    (expect, document) => {
      const style = document.querySelector("style");
      expect.subjectOutput = (output) => output.code(style.textContent, "css");
      return expect.shift(style.textContent);
    }
  );

const { css, classes } = require("../src/index");

describe("css", () => {
  it("appends the styles to the body", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c25682abe");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c25682abe {background: red;}"
    );
  });

  it("supports :hover", () => {
    const foo = css`
      & {
        background: red;
      }

      &:hover {
        background: blue;
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c15455a55");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c15455a55 {background: red;}.c15455a55:hover {background: blue;}"
    );
  });

  it("supports globally scoped selectors", () => {
    const foo = css`
      & {
        margin-left: 42px;
      }

      [dir="rtl"] & {
        margin-left: 0;
        margin-right: 42px;
      }

      button& {
        border: thin solid orange;
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c37b75391");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      '.c37b75391 {margin-left: 42px;}[dir="rtl"] .c37b75391 {margin-left: 0;margin-right: 42px;}button.c37b75391 {border: thin solid orange;}'
    );
  });

  it("allows multiple rules to be combined", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    const bar = css`
      & {
        background: blue;
      }
    `;

    const baz = css`
      & {
        background: purple;
      }

      &:hover {
        background: pink;
      }
    `;

    const cn = classes(foo, bar, baz, "plain-class");

    expect(cn, "to equal snapshot", "plain-class d7b75d0b75");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".d7b75d0b75 {background: red;} .d7b75d0b75 {background: blue;} .d7b75d0b75 {background: purple;}.d7b75d0b75:hover {background: pink;}"
    );
  });

  it("allows conditionals", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    const bar = css`
      & {
        background: blue;
      }
    `;

    const cnTrue = classes(foo, true && bar);

    expect(cnTrue, "to equal snapshot", "c5d4c92070");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5d4c92070 {background: red;} .c5d4c92070 {background: blue;}"
    );

    const cnFalse = classes(foo, false && bar);

    expect(cnFalse, "to equal snapshot", "c25682abe");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5d4c92070 {background: red;} .c5d4c92070 {background: blue;} .c25682abe {background: red;}"
    );

    expect(classes(foo, true && bar), "to equal", cnTrue);

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5d4c92070 {background: red;} .c5d4c92070 {background: blue;} .c25682abe {background: red;}"
    );
  });

  it("allows placeholders", () => {
    const withBackground = (color) => css`
      & {
        background: ${color};
      }
    `;

    const cnBlue = classes(withBackground("blue"));

    expect(cnBlue, "to equal snapshot", "c6cba9811");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c6cba9811 {background: blue;}"
    );

    const cnRed = classes(withBackground("red"));

    expect(cnRed, "to equal snapshot", "c25682abe");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c6cba9811 {background: blue;} .c25682abe {background: red;}"
    );
  });

  it("honors significant whitespace", () => {
    const foo = css`
      &:before {
        content: "this is 'some' \"content\"";
        background-color: yellow;
      }

      [data-foo="also this"] & {
        background-color: orange;
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c170ef0df");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      '.c170ef0df:before {content: "this is \'some\' "content"";background-color: yellow;}[data-foo="also this"] .c170ef0df {background-color: orange;}'
    );
  });

  it("doesn't replace & in strings", () => {
    const foo = css`
      &:before {
        content: "this is 'some' & \"content\"";
        font-family: '"&weird family&"';
        background-color: yellow;
      }

      [data-foo="also this & this"] & {
        background-color: orange;
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c12f46e4b");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      '.c12f46e4b:before {content: "this is \'some\' & "content"";font-family: \'"&weird family&"\';background-color: yellow;}[data-foo="also this & this"] .c12f46e4b {background-color: orange;}'
    );
  });

  it("doesn't replace & in rules", () => {
    const foo = css`
      & {
        background: url(https://www.example.com/image?x=100&y=100);
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c133f843e");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c133f843e {background: url(https://www.example.com/image?x=100&y=100);}"
    );
  });

  it("returns a hash of the content", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    expect(classes(foo), "to equal snapshot", "c25682abe");

    const bar = css`
      & {
        background: blue;
      }
    `;

    expect(classes(bar), "to equal snapshot", "c6cba9811");

    const baz = css`
      & {
        background: red;
      }
    `;

    expect(classes(baz), "to equal", classes(foo));
  });
});
