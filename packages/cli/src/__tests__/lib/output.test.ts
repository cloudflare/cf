import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatOutput } from "../../lib/output.js";
import { Page } from "../../sdk/sdk/core/pagination/Page.js";

/**
 * Unit tests for `lib/output.ts` — `formatOutput`, the single sink every
 * command uses to emit its result.
 *
 * The behaviours that matter for scripting correctness:
 *  - `--quiet` emits nothing at all.
 *  - A null/undefined result (successful mutation, no payload) must NOT
 *    print the literal string `null` to stdout — scripts piping to `jq`
 *    should see an empty stream. On a TTY, a `✓ <successLabel>` line is
 *    written to **stderr** instead, so stdout stays pristine.
 *  - Real data is pretty-printed as JSON to stdout.
 *
 * Colors are auto-disabled in the test runner (stdout is not a TTY →
 * chalk level 0), so JSON assertions compare against plain text.
 */
describe("formatOutput", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let stderrWrite: string[];
	let originalStderrWrite: typeof process.stderr.write;
	let originalStderrIsTTY: boolean | undefined;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		stderrWrite = [];
		originalStderrWrite = process.stderr.write.bind(process.stderr);
		// `as unknown` because the real signature is overloaded
		// (Buffer vs string + optional callback).
		(process.stderr.write as unknown) = (chunk: unknown) => {
			stderrWrite.push(String(chunk));
			return true;
		};
		originalStderrIsTTY = process.stderr.isTTY;
	});

	afterEach(() => {
		logSpy.mockRestore();
		(process.stderr.write as unknown) = originalStderrWrite;
		Object.defineProperty(process.stderr, "isTTY", {
			value: originalStderrIsTTY,
			configurable: true,
		});
	});

	function setStderrTTY(value: boolean) {
		Object.defineProperty(process.stderr, "isTTY", {
			value,
			configurable: true,
		});
	}

	/** Parse the JSON printed by the first `console.log` call. */
	function loggedJson(): unknown {
		const [first] = logSpy.mock.calls;
		return JSON.parse(String(first?.[0]));
	}

	it("emits nothing when quiet", () => {
		formatOutput({ a: 1 }, { quiet: true });
		expect(logSpy).not.toHaveBeenCalled();
		expect(stderrWrite).toEqual([]);
	});

	it("pretty-prints JSON for object data on stdout", () => {
		formatOutput({ name: "db", port: 5432 });
		expect(logSpy).toHaveBeenCalledOnce();
		expect(loggedJson()).toEqual({ name: "db", port: 5432 });
	});

	it("prints arrays and scalars as JSON too", () => {
		formatOutput(["a", "b"]);
		expect(loggedJson()).toEqual(["a", "b"]);
	});

	it("prints the payload from a Fern page response", () => {
		formatOutput({
			result: [{ id: "one" }, { id: "two" }],
			result_info: { page: 1, total_pages: 1 },
		});
		expect(loggedJson()).toEqual([{ id: "one" }, { id: "two" }]);
	});

	it("warns on stderr when an unfiltered page omits later results", () => {
		formatOutput(
			{
				result: Array.from({ length: 10 }, (_, id) => ({ id })),
				result_info: { page: 1, per_page: 10, count: 10, total_count: 46 },
			},
			{ paginationQuery: { page: undefined, per_page: undefined } }
		);
		expect(loggedJson()).toHaveLength(10);
		expect(stderrWrite.join("")).toBe(
			"Showing 10 of 46 results (page 1 of 5); use --page 2 for more.\n"
		);
	});

	it("uses total_pages when the response omits total_count", () => {
		formatOutput(
			{ result: [{ id: "one" }], result_info: { page: 2, total_pages: 3 } },
			{ paginationQuery: { page: 2, per_page: undefined } }
		);
		expect(stderrWrite.join("")).toBe(
			"Showing page 2 of 3; use --page 3 for more.\n"
		);
	});

	it("does not mistake an unfiltered total for more matching results", () => {
		formatOutput(
			{
				result: [{ id: "match" }],
				result_info: { page: 1, per_page: 10, count: 1, total_count: 46 },
			},
			{
				paginationQuery: {
					page: undefined,
					per_page: undefined,
					name: "match",
				},
			}
		);
		expect(stderrWrite).toEqual([]);
	});

	it("does not warn on the final page or inconsistent metadata", () => {
		formatOutput(
			{
				result: [{ id: "last" }],
				result_info: { page: 3, per_page: 10, count: 1, total_count: 21 },
			},
			{ paginationQuery: { page: 3, per_page: 10 } }
		);
		formatOutput(
			{
				result: [{ id: "one" }],
				result_info: { page: 1, per_page: 10, count: 9, total_count: 46 },
			},
			{ paginationQuery: { page: undefined, per_page: undefined } }
		);
		expect(stderrWrite).toEqual([]);
	});

	it("prints the items from a Fern Page instance", () => {
		const items = [{ name: "bar" }, { name: "foo" }];
		const response = {
			result: items,
			result_info: { count: 2, cursor: "" },
		};
		const page = new Page({
			response,
			rawResponse: {
				headers: new Headers(),
				redirected: false,
				status: 200,
				statusText: "OK",
				type: "default",
				url: "",
			},
			hasNextPage: () => false,
			getItems: ({ result }) => result,
			loadPage: () => {
				throw new Error("No next page");
			},
		});
		formatOutput(page);
		expect(loggedJson()).toEqual(items);
	});

	it("preserves ordinary objects with a result field", () => {
		const data = { result: "complete", result_info: { duration: 10 } };
		formatOutput(data);
		expect(loggedJson()).toEqual(data);
	});

	it("stays silent on stdout for a null result (no literal 'null')", () => {
		setStderrTTY(false);
		formatOutput(null, { successLabel: "Deleted namespace" });
		expect(logSpy).not.toHaveBeenCalled();
		// Non-TTY: not even the ✓ line.
		expect(stderrWrite.join("")).toBe("");
	});

	it("writes a ✓ success line to stderr for a null result on a TTY", () => {
		setStderrTTY(true);
		formatOutput(null, { successLabel: "Deleted namespace" });
		expect(logSpy).not.toHaveBeenCalled();
		const err = stderrWrite.join("");
		expect(err).toContain("✓");
		expect(err).toContain("Deleted namespace");
	});

	it("treats undefined like null", () => {
		setStderrTTY(true);
		formatOutput(undefined, { successLabel: "Done" });
		expect(logSpy).not.toHaveBeenCalled();
		expect(stderrWrite.join("")).toContain("Done");
	});

	it("does not write a success line when no successLabel is given", () => {
		setStderrTTY(true);
		formatOutput(null);
		expect(stderrWrite.join("")).toBe("");
	});
});
