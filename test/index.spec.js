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

    expect(cn, "to equal snapshot", "c5c008d7a");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c5c008d7a {
          background: red;
        }
      `
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

    expect(cn, "to equal snapshot", "c43aef101");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c43aef101 {
          background: red;
        }

        .c43aef101:hover {
          background: blue;
        }
      `
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

    expect(cn, "to equal snapshot", "c6f3da4bd");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c6f3da4bd {
          margin-left: 42px;
        }

        [dir="rtl"] .c6f3da4bd {
          margin-left: 0;
          margin-right: 42px;
        }

        button.c6f3da4bd {
          border: thin solid orange;
        }
      `
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

    expect(cn, "to equal snapshot", "plain-class c5b172c95");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c5b172c95 {
          background: red;
        }
        .c5b172c95 {
          background: blue;
        }
        .c5b172c95 {
          background: purple;
        }

        .c5b172c95:hover {
          background: pink;
        }
      `
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

    expect(cnTrue, "to equal snapshot", "c47fc33e7");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c47fc33e7 {
          background: red;
        }
        .c47fc33e7 {
          background: blue;
        }
      `
    );

    const cnFalse = classes(foo, false && bar);

    expect(cnFalse, "to equal snapshot", "c5c008d7a");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c47fc33e7 {
          background: red;
        }
        .c47fc33e7 {
          background: blue;
        }
        .c5c008d7a {
          background: red;
        }
      `
    );

    expect(classes(foo, true && bar), "to equal", cnTrue);

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c47fc33e7 {
          background: red;
        }
        .c47fc33e7 {
          background: blue;
        }
        .c5c008d7a {
          background: red;
        }
      `
    );
  });

  it("allows placeholders", () => {
    const withBackground = (color) => css`
      & {
        background: ${color};
      }
    `;

    const cnBlue = classes(withBackground("blue"));

    expect(cnBlue, "to equal snapshot", "c1d5d5449");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c1d5d5449 {
          background: blue;
        }
      `
    );

    const cnRed = classes(withBackground("red"));

    expect(cnRed, "to equal snapshot", "c5c008d7a");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c1d5d5449 {
          background: blue;
        }
        .c5c008d7a {
          background: red;
        }
      `
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

    expect(cn, "to equal snapshot", "c6b91fe5b");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      expect.unindent`
        .c6b91fe5b:before {
          content: "this is 'some' "content"";
          background-color: yellow;
        }

        [data-foo="also this"] .c6b91fe5b {
          background-color: orange;
        }
      `
    );
  });

  it("returns a hash of the content", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    expect(classes(foo), "to equal snapshot", "c5c008d7a");

    const bar = css`
      & {
        background: blue;
      }
    `;

    expect(classes(bar), "to equal snapshot", "c1d5d5449");

    const baz = css`
      & {
        background: red;
      }
    `;

    expect(classes(baz), "to equal", classes(foo));
  });
});
