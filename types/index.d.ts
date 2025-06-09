export class CSSTemplate {
  /**
   * Returns the generated CSS class name (and returns it also as a side‐effect of
   * inserting the actual CSS into the document if not already inserted).
   */
  toString(): string;
}

export class CSSClasses {
  /**
   * Returns a string containing the list of CSS class names.
   */
  toString(): string;
}

/**
 * A tagged template literal function that you can use to declare CSS.
 *
 * Example:
 *   const button = css`
 *     color: red;
 *     &:hover { color: blue; }
 *   `;
 */
export function css(
  strings: TemplateStringsArray,
  ...values: any[]
): CSSTemplate;

/**
 * Combines multiple CSS class values (either strings, CSSTemplate instances,
 * or nestings of CSSClasses) into a single CSSClasses instance. When converted
 * to a string (such as when rendered in a class attribute), the correct class names
 * are output.
 *
 * Example:
 *   const btnClass = classes("global-class", button);
 */
export function classes(
  ...args: Array<string | CSSTemplate | CSSClasses>
): CSSClasses;
