import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	readFileForFlag,
	resolveFileToken,
} from "../../lib/input-validation.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * Tests for `lib/input-validation.ts`.
 *
 * cf does NOT pre-validate or "harden" resource ids / string flags.
 * It's a client-side CLI driving the user's own credentials — there's
 * no trust boundary, so rejecting `..` / control chars / `?#%` in a
 * path param guards nothing the user couldn't do by hitting the API
 * directly. The module's remaining job is curl-style `@file` ingestion
 * for body flags.
 *
 * Correct URL construction means percent-encoding path params so a value
 * reaches the API verbatim. The first describe pins that contract through
 * a real generated command.
 */

describe("SDK URL-encodes positional path params", () => {
	/**
	 * `kv namespaces get <namespaceId>` is a stable two-path-param GET whose
	 * subject sits at the tail of the path, so an unencoded value visibly
	 * leaks extra segments/query/fragment into the captured URL.
	 */
	runInTempDir();
	setupMsw();

	const SAFE_ACCOUNT = "safe-account";
	// TEST_BASE_URL = https://api.test/client/v4
	const PREFIX_SEGMENTS = [
		"client",
		"v4",
		"accounts",
		SAFE_ACCOUNT,
		"storage",
		"kv",
		"namespaces",
	];

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token");
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", TEST_BASE_URL);
	});

	/**
	 * Drive the real SDK with `namespaceId` and capture, via MSW, the
	 * exact URL `globalThis.fetch` is asked to request.
	 */
	async function capturedUrl(namespaceId: string): Promise<URL> {
		let captured: string | undefined;
		server.use(
			http.all(`${TEST_BASE_URL}/*`, ({ request }) => {
				captured = request.url;
				return HttpResponse.json({ success: true, result: null });
			})
		);
		await runCf(["kv", "namespaces", "get", namespaceId], {
			CLOUDFLARE_API_TOKEN: "test-token",
			CLOUDFLARE_BASE_URL: TEST_BASE_URL,
			CLOUDFLARE_ACCOUNT_ID: SAFE_ACCOUNT,
		});
		if (captured === undefined) {
			throw new Error("SDK issued no request");
		}
		return new URL(captured);
	}

	// Ids containing characters that MUST be percent-encoded to reach
	// the API intact. None of these are "attacks" — a client-side CLI
	// has no trust boundary to defend — they just have to round-trip.
	const idsNeedingEncoding = [
		"a b c", // space
		"caf\u00e9", // unicode
		"a/b", // reserved path separator
		"100%", // percent
		"a?b", // reserved query char
		"a#b", // reserved fragment char
		"a+b", // plus
	];

	it("confines each id to a single encoded path segment", async () => {
		for (const id of idsNeedingEncoding) {
			const url = await capturedUrl(id);

			// No query or fragment leaks out of the id.
			expect(url.search).toBe("");
			expect(url.hash).toBe("");

			// Exactly one path segment beyond the fixed prefix: the
			// encoded id. An un-encoded `/` would add segments here and
			// fail the length check.
			const parts = url.pathname.split("/").filter(Boolean);
			expect(parts.slice(0, PREFIX_SEGMENTS.length)).toEqual(PREFIX_SEGMENTS);
			expect(parts).toHaveLength(PREFIX_SEGMENTS.length + 1);
		}
	});

	it("round-trips each id so the server sees the literal value", async () => {
		for (const id of idsNeedingEncoding) {
			const url = await capturedUrl(id);
			const tail = url.pathname.split("/").filter(Boolean).at(-1) ?? "";
			expect(decodeURIComponent(tail)).toBe(id);
		}
	});
});

describe("readFileForFlag", () => {
	runInTempDir();

	it("reads a non-empty file into a Buffer", async () => {
		await seed({ "payload.bin": "raw-bytes" });
		const buf = readFileForFlag("payload.bin");
		expect(Buffer.isBuffer(buf)).toBe(true);
		expect(buf.toString("utf-8")).toBe("raw-bytes");
	});

	it("throws a friendly error for a missing file (no raw ENOENT, no cwd leak)", () => {
		expect(() => readFileForFlag("does-not-exist.bin")).toThrow(
			"Cannot read invalid or empty file: does-not-exist.bin"
		);
	});

	it("rejects an empty file up-front", async () => {
		await seed({ "empty.bin": "" });
		expect(() => readFileForFlag("empty.bin")).toThrow(
			"Cannot read invalid or empty file: empty.bin"
		);
	});
});

describe("resolveFileToken", () => {
	runInTempDir();

	it("passes undefined through unchanged", () => {
		expect(resolveFileToken(undefined, "data")).toBeUndefined();
	});

	it("passes a literal (non-@) value through verbatim, control chars and all", () => {
		expect(resolveFileToken("literal", "data")).toBe("literal");
		expect(resolveFileToken("bad\u0000", "data")).toBe("bad\u0000");
	});

	it("reads `@file` as UTF-8 text by default", async () => {
		await seed({ "note.txt": "hello from file" });
		expect(resolveFileToken("@note.txt", "data")).toBe("hello from file");
	});

	it("reads a text `@file` verbatim, including control chars", async () => {
		await seed({ "ctrl.txt": "ok\u0000bad" });
		expect(resolveFileToken("@ctrl.txt", "data")).toBe("ok\u0000bad");
	});

	it("returns a Buffer for binary format", async () => {
		await seed({ "blob.bin": "\u0000\u0001\u0002raw" });
		const out = resolveFileToken("@blob.bin", "data", "binary");
		expect(Buffer.isBuffer(out)).toBe(true);
	});

	it("base64-encodes file contents for base64 format", async () => {
		await seed({ "b.txt": "hi" });
		expect(resolveFileToken("@b.txt", "data", "base64")).toBe(
			Buffer.from("hi").toString("base64")
		);
	});

	it("parses JSON for json format", async () => {
		await seed({ "obj.json": '{"a":1,"b":["x"]}' });
		expect(resolveFileToken("@obj.json", "data", "json")).toEqual({
			a: 1,
			b: ["x"],
		});
	});

	it("wraps invalid JSON with the flag name", async () => {
		await seed({ "bad.json": "{not json" });
		expect(() => resolveFileToken("@bad.json", "data", "json")).toThrow(
			/--data: file at 'bad\.json' is not valid JSON/
		);
	});

	it("errors on a bare `@` with no path", () => {
		expect(() => resolveFileToken("@", "data")).toThrow(
			"--data '@' must be followed by a file path (got empty path)"
		);
	});

	it("wraps a missing-file read error with the flag name and path", () => {
		expect(() => resolveFileToken("@nope.txt", "data")).toThrow(
			/--data: cannot read file at 'nope\.txt'/
		);
	});
});
