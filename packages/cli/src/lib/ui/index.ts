/**
 * UI module — barrel for the visual surface of cf's CLI.
 *
 * Most callers import named exports directly from this barrel rather
 * than reaching into the per-file modules. Only entries with live
 * external callers are surfaced.
 */

export { formatCommand, renderPromptIntro } from "./banner.js";
export { errorBlock } from "./blocks.js";
export { hint, info, success, warning } from "./format.js";
export { colorPalette, supportsColor, symbols, theme } from "./theme.js";
