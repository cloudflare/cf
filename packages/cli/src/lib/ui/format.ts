/**
 * Format module — one-line symbol-prefixed message helpers.
 *
 * Only the helpers with live external callers are exported. For multi-
 * line framed messages, use `errorBlock` from `./blocks.js` instead.
 *
 * Removed helpers include `labelValue`, `command`, `listItem`, `sectionHeader`,
 * `dim`, `bold`, `brand`, and the `error` symbol-prefix helper (the framed
 * `errorBlock` is what every error site uses).
 */

import { symbols, theme } from "./theme.js";

/**
 * Format a success message with checkmark.
 *
 * @example
 * console.log(success('Zone created successfully'));
 * // ✔ Zone created successfully
 */
export function success(message: string): string {
	return `${theme.success(symbols.success)} ${message}`;
}

/**
 * Format a warning message with warning symbol.
 *
 * @example
 * console.log(warning('Zone will be deleted'));
 * // ⚠ Zone will be deleted
 */
export function warning(message: string): string {
	return `${theme.warning(symbols.warning)} ${message}`;
}

/**
 * Format an info message with info symbol.
 *
 * @example
 * console.log(info('Use --help for more options'));
 * // ℹ Use --help for more options
 */
export function info(message: string): string {
	return `${theme.info(symbols.info)} ${message}`;
}

/**
 * Format a hint/tip message with arrow prefix.
 *
 * @example
 * console.log(hint('Run cf dns --help for more options'));
 * // → Run cf dns --help for more options
 */
export function hint(message: string): string {
	return `${theme.muted(symbols.arrow)} ${theme.muted(message)}`;
}
