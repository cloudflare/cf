import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import {
	type CommandsMetadata,
	isCommandsMetadata,
	loadMeta,
} from "../../lib/metadata.js";

/**
 * Unit tests for `lib/metadata.ts` — the single loader for the
 * generator's `_meta/*.json` sidecars (commands / hand-written commands /
 * schemas).
 *
 * Two behaviours matter:
 *  - `isCommandsMetadata` is the runtime shape guard the loader (and
 *    callers) narrow on; it must reject anything without a `commands`
 *    array without throwing.
 *  - `loadMeta` probes a fixed list of candidate paths relative to the
 *    caller's `import.meta.url`, parses the first that exists + passes
 *    the guard, and caches the result (including `null`) per
 *    `url::filename`. The first candidate is `<callerDir>/_meta/<file>`,
 *    so tests anchor a fake caller URL inside a temp dir and seed that
 *    layout.
 *
 * Each test uses a unique fake caller URL so the module-level
 * `META_CACHE` (which lives for the whole test process) can't leak
 * between cases.
 */

/** A trivial guard so loadMeta tests don't depend on CommandsMetadata. */
function isRecord(v: unknown): v is { ok: boolean } {
	return typeof v === "object" && v !== null && "ok" in v;
}

let counter = 0;
/** A fresh `file://` caller URL whose dir is the temp cwd. */
function freshCallerUrl(): string {
	counter += 1;
	return pathToFileURL(join(process.cwd(), `caller-${counter}.js`)).href;
}

function seedMeta(filename: string, contents: string): void {
	const dir = join(process.cwd(), "_meta");
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, filename), contents);
}

describe("isCommandsMetadata", () => {
	it("accepts an object with a commands array", () => {
		expect(isCommandsMetadata({ commands: [] })).toBe(true);
		expect(
			isCommandsMetadata({ version: "1", commands: [{ name: "x" }] })
		).toBe(true);
	});

	it("rejects null and non-objects", () => {
		expect(isCommandsMetadata(null)).toBe(false);
		expect(isCommandsMetadata("nope")).toBe(false);
		expect(isCommandsMetadata(42)).toBe(false);
	});

	it("rejects objects without a commands array", () => {
		expect(isCommandsMetadata({})).toBe(false);
		expect(isCommandsMetadata({ commands: "not-an-array" })).toBe(false);
	});
});

describe("loadMeta", () => {
	runInTempDir();

	it("loads + parses the first candidate (<callerDir>/_meta/<file>)", () => {
		seedMeta("commands.json", '{"ok":true}');
		const result = loadMeta(freshCallerUrl(), "commands.json", isRecord);
		expect(result).toEqual({ ok: true });
	});

	it("returns null when no candidate path exists", () => {
		expect(loadMeta(freshCallerUrl(), "missing.json", isRecord)).toBeNull();
	});

	it("returns null when the file exists but fails the guard", () => {
		seedMeta("bad-shape.json", '{"nope":true}');
		expect(loadMeta(freshCallerUrl(), "bad-shape.json", isRecord)).toBeNull();
	});

	it("returns null when the file exists but is not valid JSON", () => {
		seedMeta("corrupt.json", "{not json");
		expect(loadMeta(freshCallerUrl(), "corrupt.json", isRecord)).toBeNull();
	});

	it("caches a successful read (later file mutations are not observed)", () => {
		const url = freshCallerUrl();
		seedMeta("cached.json", '{"ok":true}');
		expect(loadMeta(url, "cached.json", isRecord)).toEqual({ ok: true });
		// Mutate the file underneath; the cached value should be returned.
		seedMeta("cached.json", '{"ok":false}');
		expect(loadMeta(url, "cached.json", isRecord)).toEqual({ ok: true });
	});

	it("caches a null result (a later-created file is not picked up)", () => {
		const url = freshCallerUrl();
		expect(loadMeta(url, "late.json", isRecord)).toBeNull();
		// Create the file after the miss; cache should still return null.
		seedMeta("late.json", '{"ok":true}');
		expect(loadMeta(url, "late.json", isRecord)).toBeNull();
	});

	it("narrows to the typed metadata via the supplied guard", () => {
		seedMeta(
			"commands.json",
			JSON.stringify({ version: "1", generatedAt: "build-time", commands: [] })
		);
		const result = loadMeta<CommandsMetadata>(
			freshCallerUrl(),
			"commands.json",
			isCommandsMetadata
		);
		expect(result?.commands).toEqual([]);
		expect(result?.version).toBe("1");
	});
});
