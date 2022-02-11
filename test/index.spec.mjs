import unexpected from "unexpected";

import unexpectedDom from "unexpected-dom";
import unexpectedSnapshot from "unexpected-snapshot";
import unexpectedPrism from "unexpected-prism";

import { css, classes } from "../src/index.mjs";

const expect = unexpected
  .clone()
  .use(unexpectedDom)
  .use(unexpectedSnapshot)
  .use(unexpectedPrism)
  .addAssertion(
    "<DOMDocument> to have CSS satisfying <assertion>",
    (expect, document) => {
      const style = document.querySelector("style");
      expect.subjectOutput = (output) => output.code(style.textContent, "css");
      return expect.shift(style.textContent);
    }
  );

describe("css", () => {
  it("appends the styles to the body", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    expect(foo.toString(), "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}"
    );
  });

  it("appends the styles to the stylesheat when calling toString", () => {
    const foo = css`
      & {
        background: red;
      }
    `;

    expect(foo.toString(), "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}"
    );

    expect(foo.toString(), "to equal snapshot", "c5908582");

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

    expect(foo.toString(), "to equal snapshot", "c76beb9ab");

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

    expect(foo.toString(), "to equal snapshot", "c66589bb1");

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

    expect(
      classes(foo, bar, baz, "plain-class").toString(),
      "to equal snapshot",
      "plain-class c5908582 c5bb262d1 c2a4d609c"
    );

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c2a4d609c {background: purple;}.c2a4d609c:hover {background: pink;}"
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
      classes(foo, bar, baz).toString(),
      "to equal snapshot",
      "c5908582 c5bb262d1 c72eebb73"
    );

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}"
    );

    const qux = css`
      & {
        background: orange;
      }
    `;

    expect(
      classes(foo, bar, qux).toString(),
      "to equal snapshot",
      "c5908582 c5bb262d1 c70314c25"
    );

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}.c70314c25 {background: orange;}"
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

    expect(
      classes(foo, bar).toString(),
      "to equal snapshot",
      "c5908582 c5bb262d1"
    );

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}"
    );

    expect(classes(bar, foo).toString(), "to equal snapshot", "d465928a0");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.d465928a0 {background: blue;} .d465928a0 {background: red;}"
    );

    const qux = css`
      & {
        background: orange;
      }
    `;

    expect(classes(qux, foo).toString(), "to equal snapshot", "c103cb0e1c4");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.d465928a0 {background: blue;} .d465928a0 {background: red;}.c103cb0e1c4 {background: orange;} .c103cb0e1c4 {background: red;}"
    );
  });

  describe("when lists of classes is nested", () => {
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
        classes(foo, classes(bar, baz)).toString(),
        "to equal snapshot",
        "c5908582 c5bb262d1 c72eebb73"
      );

      expect(
        document,
        "to have CSS satisfying",
        "to equal snapshot",
        ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}"
      );

      const qux = css`
        & {
          background: orange;
        }
      `;

      expect(
        classes(foo, classes(bar, qux)).toString(),
        "to equal snapshot",
        "c5908582 c5bb262d1 c70314c25"
      );

      expect(
        document,
        "to have CSS satisfying",
        "to equal snapshot",
        ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}.c70314c25 {background: orange;}"
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

      const baz = css`
        & {
          background: purple;
        }
      `;

      expect(
        classes(foo, classes(bar, baz)).toString(),
        "to equal snapshot",
        "c5908582 c5bb262d1 c72eebb73"
      );

      expect(
        document,
        "to have CSS satisfying",
        "to equal snapshot",
        ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}"
      );

      expect(
        classes(classes(bar, foo), baz).toString(),
        "to equal snapshot",
        "c1eb9dd1f57c"
      );

      expect(
        document,
        "to have CSS satisfying",
        "to equal snapshot",
        ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}.c1eb9dd1f57c {background: blue;} .c1eb9dd1f57c {background: red;} .c1eb9dd1f57c {background: purple;}"
      );

      const qux = css`
        & {
          background: orange;
        }
      `;

      expect(
        classes(foo, qux, classes(bar, baz)).toString(),
        "to equal snapshot",
        "c6b2b1cb2756"
      );

      expect(
        document,
        "to have CSS satisfying",
        "to equal snapshot",
        ".c5908582 {background: red;}.c5bb262d1 {background: blue;}.c72eebb73 {background: purple;}.c1eb9dd1f57c {background: blue;} .c1eb9dd1f57c {background: red;} .c1eb9dd1f57c {background: purple;}.c6b2b1cb2756 {background: red;} .c6b2b1cb2756 {background: orange;} .c6b2b1cb2756 {background: blue;} .c6b2b1cb2756 {background: purple;}"
      );
    });
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

    const cnTrue = classes(foo, true && bar).toString();

    expect(cnTrue, "to equal snapshot", "c5908582 c5bb262d1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}"
    );

    const cnFalse = classes(foo, false && bar).toString();

    expect(cnFalse, "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}"
    );

    expect(classes(foo, true && bar).toString(), "to equal", cnTrue);

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5908582 {background: red;}.c5bb262d1 {background: blue;}"
    );
  });

  it("allows placeholders", () => {
    const withBackground = (color) => css`
      & {
        background: ${color};
      }
    `;

    const cnBlue = classes(withBackground("blue")).toString();

    expect(cnBlue, "to equal snapshot", "c5bb262d1");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5bb262d1 {background: blue;}"
    );

    const cnRed = classes(withBackground("red")).toString();

    expect(cnRed, "to equal snapshot", "c5908582");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c5bb262d1 {background: blue;}.c5908582 {background: red;}"
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

    expect(foo.toString(), "to equal snapshot", "c6bc3aec1");

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

    expect(foo.toString(), "to equal snapshot", "c7e34b1b5");

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

    expect(foo.toString(), "to equal snapshot", "c6047b53e");

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

    expect(foo.toString(), "to equal snapshot", "c5908582");

    const bar = css`
      & {
        background: blue;
      }
    `;

    expect(bar.toString(), "to equal snapshot", "c5bb262d1");

    const baz = css`
      & {
        background: red;
      }
    `;

    expect(baz.toString(), "to equal", foo.toString());
  });

  it("provides hashes identifiers", () => {
    const foo = css`
      & {
        animation: 750ms linear 0s 1 normal none running &(fade-in);
      }

      @keyframes &(fade-in) {
        0%,
        60% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    `;

    expect(foo.toString(), "to equal snapshot", "c68fe167a");

    expect(
      document,
      "to have CSS satisfying",
      "to equal snapshot",
      ".c68fe167a {animation: 750ms linear 0s 1 normal none running c68fe167a-fade-in;}@keyframes c68fe167a-fade-in {0%,60% {opacity: 0;}100% {opacity: 1;}}"
    );
  });
});
