# Stylewars

[![Checks](https://github.com/sunesimonsen/stylewars/workflows/Checks/badge.svg)](https://github.com/sunesimonsen/stylewars/actions?query=workflow%3AChecks+branch%3Amain)
[![Bundle Size](https://flat.badgen.net/bundlephobia/minzip/stylewars@1.4.0)](https://bundlephobia.com/result?p=stylewars)

A tiny CSS in JS library that requires no tooling.

Just define your CSS rules and apply them.

- Easy learning curve
- Only one concept on top of CSS
- Gives you all of the power of CSS
- Framework agnostic
- Unique class names

[Live examples](https://stylewars.surge.sh/)

[![Style Wars (1983)](https://i.ytimg.com/vi/f9KxbaSU-Eo/hqdefault.jpg)](https://www.youtube.com/embed/f9KxbaSU-Eo)

## Installation

```sh
npm install stylewars
```

## Usage

[See the live examples](https://stylewars.surge.sh/)

This example shows usage together with React, but the library can be used
together with any framework.

```js
import React from "react";
import { css, classes } from "stylewars";

const buttonStyles = css`
  & {
    border-radius: 4px;
    background: #587894;
    color: white;
    border: none;
    padding: 0.5em 2em;
  }

  &:hover {
    background: #89a2b9;
  }
`;

const BoringButton = ({ children, ...other }) => (
  <button {...other} className={classes(buttonStyles)}>
    {children}
  </button>
);
```

As you can see it is just plain CSS with one exception `&` will be replaced by a
unique class.

### Using placeholders

You can also use placeholders to generate classes dynamically.

```js
import { lighten } from "polished";

const coloredBackground = (color) => css`
  & {
    background: ${color};
  }

  &:hover {
    background: ${lighten(0.2, color)};
  }
`;

const FancyButton = ({ color, children, ...other }) => (
  <button
    {...other}
    className={classes(buttonStyles, coloredBackground(color))}
  >
    {children}
  </button>
);
```

Just make sure only to use this method for a limited amount of values as it
generates new classes. Alternatively you can use [CSS
variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).

### Using global classes

If you need to apply a global class, it can be done this way:

```js
const GloballyStyldedButton = ({ color, children, ...other }) => (
  <button
    {...other}
    className={classes("global-class", coloredBackground(color))}
  >
    {children}
  </button>
);
```

### Conditional styling

You can conditional apply styles this way:

```js
const MaybeColoredButton = ({ color, children, ...other }) => (
  <button
    {...other}
    className={classes(buttonStyles, color && coloredBackground(color))}
  >
    {children}
  </button>
);
```

### Theming

You just use [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).

```js
const themedButtonStyles = css`
  & {
    background: var(--accent-color, #587894);
    color: var(--text-color, white);
  }

  &:hover {
    background: var(--accent-highlight-color, #89a2b9);
  }
`;

const ThemedButton = ({ color, children, ...other }) => (
  <button {...other} class={classes(buttonStyles, themedButtonStyles)}>
    {children}
  </button>
);
```

Now you can apply a theme to the DOM sub-tree the following way:

```js
const yellowTheme = css`
  & {
    --text-color: black;
    --accent-color: #fed6a8;
    --accent-highlight-color: #ffb057;
  }
`;

const Example = () => (
  <section className={classes(yellowTheme)}>
    <ThemedButton>I'm themed</ThemedButton>
  </section>
);
```

## MIT License

Copyright (c) 2020 Sune Simonsen <mailto:sune@we-knowhow.dk>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
