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

    expect(cn, "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}"
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

    expect(cn, "to equal snapshot", "c76beb9ab");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c76beb9ab {background: red;}.c76beb9ab:hover {background: blue;}"
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

    expect(cn, "to equal snapshot", "c66589bb1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      '.c66589bb1 {margin-left: 42px;}[dir="rtl"] .c66589bb1 {margin-left: 0;margin-right: 42px;}button.c66589bb1 {border: thin solid orange;}'
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

    expect(cn, "to equal snapshot", "plain-class c5908582 c5bb262d1 c2a4d609c");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;} .c2a4d609c {background: purple;}.c2a4d609c:hover {background: pink;}"
    );
  });

  it("reuses classes if they are in the right order in the stylesheet", () => {
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
    `;

    expect(
      classes(foo, bar, baz),
      "to equal snapshot",
      "c5908582 c5bb262d1 c72eebb73"
    );

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;} .c72eebb73 {background: purple;}"
    );

    const qux = css`
      & {
        background: orange;
      }
    `;

    expect(
      classes(foo, bar, qux),
      "to equal snapshot",
      "c5908582 c5bb262d1 c70314c25"
    );

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;} .c72eebb73 {background: purple;} .c70314c25 {background: orange;}"
    );
  });

  it("doesn't reuses classes if they are in the wrong order in the stylesheet", () => {
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

    expect(classes(foo, bar), "to equal snapshot", "c5908582 c5bb262d1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;}"
    );

    expect(classes(bar, foo), "to equal snapshot", "d465928a0");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;} .d465928a0 {background: blue;} .d465928a0 {background: red;}"
    );

    const qux = css`
      & {
        background: orange;
      }
    `;

    expect(classes(qux, foo), "to equal snapshot", "c103cb0e1c4");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;} .d465928a0 {background: blue;} .d465928a0 {background: red;} .c103cb0e1c4 {background: orange;} .c103cb0e1c4 {background: red;}"
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

    expect(cnTrue, "to equal snapshot", "c5908582 c5bb262d1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;}"
    );

    const cnFalse = classes(foo, false && bar);

    expect(cnFalse, "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;}"
    );

    expect(classes(foo, true && bar), "to equal", cnTrue);

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;} .c5bb262d1 {background: blue;}"
    );
  });

  it("allows placeholders", () => {
    const withBackground = (color) => css`
      & {
        background: ${color};
      }
    `;

    const cnBlue = classes(withBackground("blue"));

    expect(cnBlue, "to equal snapshot", "c5bb262d1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5bb262d1 {background: blue;}"
    );

    const cnRed = classes(withBackground("red"));

    expect(cnRed, "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5bb262d1 {background: blue;} .c5908582 {background: red;}"
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

    expect(cn, "to equal snapshot", "c6bc3aec1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      '.c6bc3aec1:before {content: "this is \'some\' "content"";background-color: yellow;}[data-foo="also this"] .c6bc3aec1 {background-color: orange;}'
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

    expect(cn, "to equal snapshot", "c7e34b1b5");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      '.c7e34b1b5:before {content: "this is \'some\' & "content"";font-family: \'"&weird family&"\';background-color: yellow;}[data-foo="also this & this"] .c7e34b1b5 {background-color: orange;}'
    );
  });

  it("doesn't replace & in rules", () => {
    const foo = css`
      & {
        background: url(https://www.example.com/image?x=100&y=100);
      }
    `;

    const cn = classes(foo);

    expect(cn, "to equal snapshot", "c6047b53e");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c6047b53e {background: url(https://www.example.com/image?x=100&y=100);}"
    );
  });

  it("returns a hash of the content", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    expect(classes(foo), "to equal snapshot", "c5908582");

    const bar = css`
      & {
        background: blue;
      }
    `;

    expect(classes(bar), "to equal snapshot", "c5bb262d1");

    const baz = css`
      & {
        background: red;
      }
    `;

    expect(classes(baz), "to equal", classes(foo));
  });
});
