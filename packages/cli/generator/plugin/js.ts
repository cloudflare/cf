/**
 * Helpers for the semantics the generated code and its metadata depend on.
 *
 * The generator's output is defined by what JavaScript does: the order
 * `Object.entries` walks an object in, how `JSON.stringify` prints numbers,
 * what `\s` matches. Running in JavaScript, most of that comes for free.
 * What doesn't is here: `localeCompare`, which the plugin's engine has no
 * collation data for, the byte order Rust sorted some lists in, and the
 * splitting of a written name into words, as forge does it.
 */
import type { Json } from "@cloudflare/forge/plugin";

/** A JSON value the generator builds. */
export type Value =
	| null
	| boolean
	| number
	| string
	| readonly Value[]
	| { readonly [key: string]: Value };

/** A JSON object, which the generator builds by setting keys in order. */
export type Obj = { [key: string]: Value };

/** An error the generator reports, rather than a bug in it. */
export class GenerateError extends Error {}

/** Returns a new object without a prototype, so any key is its own. */
export function obj(entries: Iterable<readonly [string, Value]> = []): Obj {
	const out = Object.create(null) as Obj;
	for (const [key, value] of entries) {
		out[key] = value;
	}
	return out;
}

/** Reports whether `value` is a JSON object. */
export function isObject(
	value: Value | Json | undefined
): value is { readonly [key: string]: Value } {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the member `key` of `value`, if `value` is an object that has it
 * as its own.
 */
export function get(
	value: Value | Json | undefined,
	key: string
): Value | undefined {
	if (!isObject(value) || !Object.prototype.hasOwnProperty.call(value, key)) {
		return undefined;
	}
	return value[key];
}

/** Reports whether `value` is JavaScript-truthy; a missing value is not. */
export function truthy(value: Value | undefined): boolean {
	return Boolean(value);
}

/** `String(value)`. */
export function stringOf(value: Value): string {
	return String(value);
}

/** Reports whether `key` is an array index, which objects keep first. */
export function isArrayIndex(key: string): boolean {
	if (key.length === 0 || key.length > 10 || !/^[0-9]+$/.test(key)) {
		return false;
	}
	if (key.length > 1 && key.startsWith("0")) {
		return false;
	}
	return Number(key) < 4294967295;
}

/** `JSON.stringify(s)` for a string. */
export function quote(s: string): string {
	return JSON.stringify(s);
}

/** `JSON.stringify(value)`. */
export function stringify(value: Value): string {
	return JSON.stringify(value);
}

/** `JSON.stringify(value, null, indent)`. */
export function stringifyPretty(value: Value, indent: number): string {
	return JSON.stringify(value, null, indent);
}

/** `s.replace(/\s+/g, " ").trim()`. */
export function normalizeSpaces(s: string): string {
	return s.replace(/\s+/g, " ").trim();
}

/**
 * The primary collation weight of each printable ASCII character, in the
 * order of the root collation that `localeCompare` uses. Letters weigh the
 * same in either case.
 */
const COLLATION =
	" _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz";

function primary(c: string): number {
	const code = c.codePointAt(0) ?? 0;
	if (code < 0x80) {
		const i = COLLATION.indexOf(c.toLowerCase());
		if (i >= 0) {
			return i;
		}
	}
	return 0x1000 + code;
}

/** Reports whether the collation ignores `c`, as it does control characters. */
function ignorable(c: string): boolean {
	const code = c.codePointAt(0) ?? 0;
	return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
}

function compareLists(a: readonly number[], b: readonly number[]): number {
	const n = Math.min(a.length, b.length);
	for (let i = 0; i < n; i++) {
		const x = a[i] as number;
		const y = b[i] as number;
		if (x !== y) {
			return x < y ? -1 : 1;
		}
	}
	return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
}

/** The primary and tertiary weights of a string's characters. */
type CollationKey = readonly [readonly number[], readonly number[]];

/** The keys of the strings compared so far, which sorts compare many times. */
const collationKeys = new Map<string, CollationKey>();

function collationKey(s: string): CollationKey {
	let key = collationKeys.get(s);
	if (key === undefined) {
		const chars = Array.from(s).filter((c) => !ignorable(c));
		// Lowercase sorts before uppercase.
		const tertiary = (c: string) => (c >= "A" && c <= "Z" ? 1 : 0);
		key = [chars.map(primary), chars.map(tertiary)];
		collationKeys.set(s, key);
	}
	return key;
}

/** `a.localeCompare(b)` for the strings the generator sorts. */
export function localeCompare(a: string, b: string): number {
	const [pa, ta] = collationKey(a);
	const [pb, tb] = collationKey(b);
	return compareLists(pa, pb) || compareLists(ta, tb);
}

/** Compares as `Array.prototype.sort` does without a comparator. */
export function codeUnitCompare(a: string, b: string): number {
	return a < b ? -1 : a > b ? 1 : 0;
}

/** Compares by code points, the order of UTF-8 bytes. */
export function codePointCompare(a: string, b: string): number {
	const ca = Array.from(a, (c) => c.codePointAt(0) ?? 0);
	const cb = Array.from(b, (c) => c.codePointAt(0) ?? 0);
	return compareLists(ca, cb);
}

/**
 * forge's `toKebabCase(s)`: underscores become hyphens, a hyphen goes
 * between a lowercase and an uppercase letter, and it all lowercases.
 */
export function kebab(s: string): string {
	return s
		.replaceAll("_", "-")
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.toLowerCase();
}

const PLACEHOLDER = /\{([^}]+)\}/g;

/** The names in the `{name}` placeholders of a path template, in order. */
export function templateParams(template: string): string[] {
	return Array.from(template.matchAll(PLACEHOLDER), (m) => m[1] as string);
}

/** Replaces each `{name}` placeholder of `template` with what `f` returns. */
export function replaceParams(
	template: string,
	f: (name: string) => string
): string {
	return template.replace(PLACEHOLDER, (_, name: string) => f(name));
}

/** Reports whether `name` matches `/^[A-Za-z_$][\w$]*$/`. */
export function isIdentifier(name: string): boolean {
	return /^[A-Za-z_$][\w$]*$/.test(name);
}

/** `s.trim_end_matches(suffix)`: `s` without every `suffix` it ends with. */
export function trimEndMatches(s: string, suffix: string): string {
	while (suffix.length > 0 && s.endsWith(suffix)) {
		s = s.slice(0, s.length - suffix.length);
	}
	return s;
}

/** The characters Rust's `char::is_whitespace` matches. */
const RUST_WHITESPACE =
	/[\t\n\v\f\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/u;

/** The first word of `s`, split at whitespace, or an empty string. */
export function firstWord(s: string): string | undefined {
	return s.split(RUST_WHITESPACE).find((word) => word.length > 0);
}

const ALPHABETIC = /\p{Alphabetic}/u;
const NUMERIC = /\p{N}/u;
const UPPERCASE = /\p{Uppercase}/u;
const LOWERCASE = /\p{Lowercase}/u;

/**
 * The lower-case words of the name `s` is written as, as forge's
 * `Name::new` reads them: `getByID` is "get by id".
 */
export function nameWords(s: string): string[] {
	const chars = Array.from(s);
	const words: string[] = [];
	// Where the word being read starts, and its last character.
	let start = -1;
	let prev = "";
	const flush = (end: number) => {
		if (start >= 0) {
			words.push(chars.slice(start, end).join("").toLowerCase());
			start = -1;
		}
	};
	for (let i = 0; i < chars.length; i++) {
		const c = chars[i] as string;
		if (!ALPHABETIC.test(c) && !NUMERIC.test(c)) {
			flush(i);
			continue;
		}
		if (UPPERCASE.test(c) && start >= 0) {
			// A lower-case letter or digit ends a word before an upper-case
			// one, and so does the last letter of an acronym before a new
			// word.
			const next = chars[i + 1];
			const nextLower = next !== undefined && LOWERCASE.test(next);
			if (
				LOWERCASE.test(prev) ||
				NUMERIC.test(prev) ||
				(UPPERCASE.test(prev) && nextLower)
			) {
				flush(i);
			}
		}
		if (start < 0) {
			start = i;
		}
		prev = c;
	}
	flush(chars.length);
	return words;
}

/** The last item of `items`. */
export function last<T>(items: readonly T[]): T | undefined {
	return items[items.length - 1];
}

/** Appends `item` to `list` unless it is in it. */
export function pushUnique<T>(list: T[], item: T): void {
	if (!list.includes(item)) {
		list.push(item);
	}
}

/** Returns `items` without repeats, in order. */
export function dedup<T>(items: Iterable<T>): T[] {
	const out: T[] = [];
	for (const item of items) {
		pushUnique(out, item);
	}
	return out;
}

/**
 * Sets `key` of `entries`, a list of pairs: in place if it has it, or else
 * at the end.
 */
export function setEntry<V>(
	entries: [string, V][],
	key: string,
	value: V
): void {
	const entry = entries.find(([k]) => k === key);
	if (entry) {
		entry[1] = value;
	} else {
		entries.push([key, value]);
	}
}

/** The value of `key` in `entries`, a list of pairs. */
export function getEntry<V>(
	entries: readonly (readonly [string, V])[],
	key: string
): V | undefined {
	return entries.find(([k]) => k === key)?.[1];
}
