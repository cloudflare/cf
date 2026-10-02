import { stripVTControlCharacters } from "node:util";
import chalk from "chalk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatOutput } from "../../lib/output.js";
import { theme } from "../../lib/ui/theme.js";
import { Page } from "../../sdk/sdk/core/pagination/Page.js";

const ciInfo = vi.hoisted(() => ({ isCI: false }));
vi.mock("ci-info", () => ({ default: ciInfo }));

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
 * Most tests run without a TTY or FORCE_COLOR, so JSON assertions compare
 * against plain text.
 */
describe("formatOutput", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let stderrWrite: string[];
	let originalStderrWrite: typeof process.stderr.write;
	let originalStdinIsTTY: boolean | undefined;
	let originalStderrIsTTY: boolean | undefined;
	let originalStdoutIsTTY: boolean | undefined;

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
		ciInfo.isCI = false;
		originalStdinIsTTY = process.stdin.isTTY;
		originalStderrIsTTY = process.stderr.isTTY;
		originalStdoutIsTTY = process.stdout.isTTY;
	});

	afterEach(() => {
		logSpy.mockRestore();
		(process.stderr.write as unknown) = originalStderrWrite;
		Object.defineProperty(process.stdin, "isTTY", {
			value: originalStdinIsTTY,
			configurable: true,
		});
		Object.defineProperty(process.stderr, "isTTY", {
			value: originalStderrIsTTY,
			configurable: true,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			value: originalStdoutIsTTY,
			configurable: true,
		});
		vi.unstubAllEnvs();
	});

	function setStdinTTY(value: boolean) {
		Object.defineProperty(process.stdin, "isTTY", {
			value,
			configurable: true,
		});
	}

	function setStderrTTY(value: boolean) {
		Object.defineProperty(process.stderr, "isTTY", {
			value,
			configurable: true,
		});
	}

	function setStdoutTTY(value: boolean) {
		Object.defineProperty(process.stdout, "isTTY", {
			value,
			configurable: true,
		});
	}

	function withForcedColor(action: () => void): void {
		const previousLevel = chalk.level;
		vi.stubEnv("NO_COLOR", undefined);
		vi.stubEnv("FORCE_COLOR", "1");
		try {
			chalk.level = 3;
			action();
		} finally {
			chalk.level = previousLevel;
		}
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

	it("keeps piped JSON plain when FORCE_COLOR is set", () => {
		setStdinTTY(true);
		setStdoutTTY(false);
		withForcedColor(() => {
			formatOutput({ name: "db" });
			expect(logSpy).toHaveBeenCalledWith('{\n  "name": "db"\n}');
		});
	});

	it("keeps JSON plain when stdin is piped into a TTY", () => {
		setStdinTTY(false);
		setStdoutTTY(true);
		withForcedColor(() => {
			formatOutput({ name: "db" });
			expect(logSpy).toHaveBeenCalledWith('{\n  "name": "db"\n}');
		});
	});

	it("keeps JSON plain in CI even with a TTY", () => {
		ciInfo.isCI = true;
		setStdinTTY(true);
		setStdoutTTY(true);
		withForcedColor(() => {
			formatOutput({ name: "db" });
			expect(logSpy).toHaveBeenCalledWith('{\n  "name": "db"\n}');
		});
	});

	it("highlights JSON on an interactive TTY when FORCE_COLOR is set", () => {
		setStdinTTY(true);
		setStdoutTTY(true);
		withForcedColor(() => {
			formatOutput({ name: "db" });
			expect(String(logSpy.mock.calls[0]?.[0])).toContain("\u001b[");
		});
	});

	it("prints arrays and scalars as JSON too", () => {
		formatOutput(["a", "b"]);
		expect(loggedJson()).toEqual(["a", "b"]);
	});

	describe("JSON string highlighting", () => {
		const cases = [
			{ name: "plain strings", value: "cat.com" },
			{ name: "empty strings", value: "" },
			{
				name: "escaped quotation marks",
				serializedValue: String.raw`"\"cat.com\""`,
				value: '"cat.com"',
			},
			{ name: "embedded quotation marks", value: 'say "hello"' },
			{
				name: "escaped quotation marks followed by a colon",
				serializedValue: String.raw`"\"key\": text"`,
				value: '"key": text',
			},
			{ name: "backslashes before quotation marks", value: '\\"cat.com\\"' },
			{
				name: "Windows paths with trailing backslashes",
				value: "C:\\Users\\cat\\",
			},
			{ name: "consecutive backslashes", value: "\\\\server\\share\\" },
			{ name: "other JSON escapes", value: "line\n\t\r\b\f\u0000/end" },
		];
		let originalChalkLevel: typeof chalk.level;

		beforeEach(() => {
			originalChalkLevel = chalk.level;
			chalk.level = 3;
			vi.stubEnv("FORCE_COLOR", "1");
			vi.stubEnv("NO_COLOR", undefined);
			setStdinTTY(true);
			setStdoutTTY(true);
		});

		afterEach(() => {
			chalk.level = originalChalkLevel;
		});

		it.each(cases)(
			"highlights complete $name",
			({ serializedValue, value }) => {
				const data = { value };
				formatOutput(data);

				const output = String(logSpy.mock.calls[0]?.[0]);
				expect(output).toBe(
					`{\n  ${theme.jsonKey('"value"')}: ${theme.jsonString(serializedValue ?? JSON.stringify(value))}\n}`
				);
				expect(JSON.parse(stripVTControlCharacters(output))).toEqual(data);
			}
		);

		it.each(["non-TTY stdout", "NO_COLOR"])(
			"preserves plain, parseable JSON with %s",
			(mode) => {
				if (mode === "NO_COLOR") {
					vi.stubEnv("NO_COLOR", "1");
				} else {
					setStdoutTTY(false);
				}

				const data = cases.map(({ value }) => ({ value }));
				formatOutput(data);

				expect(logSpy).toHaveBeenCalledExactlyOnceWith(
					JSON.stringify(data, null, 2)
				);
				expect(loggedJson()).toEqual(data);
			}
		);
	});

	it("prints the payload from a Fern page response", () => {
		formatOutput({
			result: [{ id: "one" }, { id: "two" }],
			result_info: { page: 1, total_pages: 1 },
		});
		expect(loggedJson()).toEqual([{ id: "one" }, { id: "two" }]);
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
