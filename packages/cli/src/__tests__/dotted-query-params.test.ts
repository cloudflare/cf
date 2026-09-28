import { describe, expect, it, vi } from "vitest";
import { runCf } from "./helpers/run-cf.js";

/**
 * Regression test for the dotted query-param wire-spelling bug.
 *
 * Query params whose OpenAPI name contains a dot (`name.exact`,
 * `comment.present`, `tag.absent`, …) are registered as kebab flags
 * (`--name-exact`) and read off `argv.nameExact`, but must be sent on
 * the wire under their original dotted name (`name.exact`).
 *
 * The generator previously keyed `queryParamMap` by the camelCase of
 * the *wire* name (`toCamelCase("name.exact")` → `name.exact`) while
 * looking it up by the camelCase of the *flag* (`nameExact`). The
 * lookup missed and fell back to the flag spelling, so the CLI sent
 * `?nameExact=…` — a parameter the API silently ignores.
 *
 * `--dry-run` echoes the assembled query bag, so we assert the wire
 * key directly without hitting the network.
 */
describe("dotted query-param wire spelling", () => {
	async function dryRunQuery(argv: string[]): Promise<Record<string, unknown>> {
		const logs: string[] = [];
		const spy = vi
			.spyOn(console, "log")
			.mockImplementation((line?: unknown) => {
				logs.push(String(line));
			});
		try {
			// NO_COLOR keeps the JSON highlighter from wrapping the output
			// in ANSI escapes, so it parses cleanly.
			await runCf(argv, { NO_COLOR: "1" });
		} finally {
			spy.mockRestore();
		}
		const output = logs.join("\n");
		const parsed = JSON.parse(output) as { query?: Record<string, unknown> };
		return parsed.query ?? {};
	}

	it("sends the dotted wire key, not the camelCase flag name", async () => {
		const query = await dryRunQuery([
			"dns",
			"records",
			"list",
			"--name-exact",
			"foo.example.com",
			"--dry-run",
		]);

		expect(query).toHaveProperty(["name.exact"], "foo.example.com");
		expect(query).not.toHaveProperty("nameExact");
	});

	it("handles multiple dotted predicates across distinct param families", async () => {
		const query = await dryRunQuery([
			"dns",
			"records",
			"list",
			"--comment-present",
			"true",
			"--tag-absent",
			"team",
			"--dry-run",
		]);

		expect(query).toHaveProperty(["comment.present"], "true");
		expect(query).toHaveProperty(["tag.absent"], "team");
		expect(query).not.toHaveProperty("commentPresent");
		expect(query).not.toHaveProperty("tagAbsent");
	});

	it("leaves underscore-spelled params (per_page) correct", async () => {
		// Sanity: the fix must not regress the already-correct
		// underscore case, where flag and wire camelization agree.
		const query = await dryRunQuery([
			"dns",
			"records",
			"list",
			"--per-page",
			"5",
			"--dry-run",
		]);

		expect(query).toHaveProperty("per_page");
		expect(query).not.toHaveProperty("perPage");
	});
});
