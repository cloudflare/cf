import { describe, expect, it } from "vite-plus/test";
import {
	catalogue,
	commandCases,
	fixturePath,
	groups,
	handwrittenCommands,
	presenceRows,
	shardCommands,
	shardGroups,
	SHARDS,
} from "./cases.js";
import { normalize, recordRequest } from "./record.js";

describe("regression coverage and request recording", () => {
	it("assigns every executable and group to exactly one shard", () => {
		const commands = shardCommands()
			.flat()
			.map((command) => command.command);
		expect(commands).toHaveLength(catalogue.commands.length);
		expect(new Set(commands).size).toBe(commands.length);
		const assignedGroups = Array.from({ length: SHARDS }, (_, shard) =>
			shardGroups(shard)
		).flat();
		expect(assignedGroups.toSorted((a, b) => a.localeCompare(b))).toEqual(
			groups.toSorted((a, b) => a.localeCompare(b))
		);
		expect(new Set(assignedGroups).size).toBe(assignedGroups.length);
	});

	it("omits every hand-written command and hand-written-only group", () => {
		expect(
			catalogue.commands.filter((command) =>
				handwrittenCommands.has(command.command)
			)
		).toEqual([]);
		expect(groups).not.toContain("access");
		expect(groups).not.toContain("workers triggers");
		expect(groups).not.toContain("d1 migrations");
	});

	it("includes an actual no-argument invocation for every executable", () => {
		for (const command of catalogue.commands) {
			expect(
				commandCases(command).find((scenario) => scenario.name === "no-args")
					?.args,
				command.command
			).toEqual([]);
		}
	});

	it("covers all four presence states for every optional-flag pair", () => {
		for (let size = 2; size <= 64; size++) {
			const rows = presenceRows(size);
			for (let first = 0; first < size; first++) {
				for (let second = first + 1; second < size; second++) {
					const states = new Set(
						rows.map((row) => `${Number(row[first])}${Number(row[second])}`)
					);
					expect(states, `width ${size}, flags ${first}/${second}`).toEqual(
						new Set(["00", "01", "10", "11"])
					);
				}
			}
		}
	});

	it("tests body-field flags without the raw-body escape hatch", () => {
		const command = catalogue.commands.find(
			(entry) => entry.command === "cf accounts members create"
		);
		if (!command) {
			throw new Error("Missing body-field coverage fixture");
		}
		const scenarios = commandCases(command);
		expect(
			scenarios.find((scenario) => scenario.name === "required")?.args
		).toContain("--body");
		const field = scenarios.find(
			(scenario) => scenario.name === "only --roles"
		);
		expect(field?.args).toContain("--roles");
		expect(field?.args).not.toContain("--body");
	});

	it("retains JSON structure, repeated query parameters and headers", async () => {
		const request = new Request("https://api.test/items?q=a&q=b", {
			method: "POST",
			headers: { "content-type": "application/json", "x-regression": "keep" },
			body: JSON.stringify({
				nested: { null: null, false: false, zero: 0 },
				list: ["second", "first"],
			}),
		});
		expect(await recordRequest(request)).toEqual({
			method: "POST",
			url: "https://api.test/items?q=a&q=b",
			headers: { "content-type": "application/json", "x-regression": "keep" },
			body: {
				nested: { null: null, false: false, zero: 0 },
				list: ["second", "first"],
			},
		});
	});

	it("preserves multipart order, duplicate parts and binary file bytes", async () => {
		const form = new FormData();
		form.append("label", "first");
		form.append("label", "second");
		form.append(
			"file",
			new Blob([new Uint8Array([0, 255, 128, 10])], {
				type: "application/octet-stream",
			}),
			"payload.bin"
		);
		const recorded = await recordRequest(
			new Request("https://api.test/upload", { method: "POST", body: form })
		);
		expect(recorded.headers["content-type"]).toBe(
			"multipart/form-data; boundary=<boundary>"
		);
		expect(recorded.body).toEqual([
			["label", "first"],
			["label", "second"],
			[
				"file",
				{
					filename: "payload.bin",
					contentType: "application/octet-stream",
					base64: "AP+ACg==",
				},
			],
		]);
	});

	it("normalizes checkout paths inside multipart fields and their variable length", async () => {
		expect(
			normalize("Cannot read 'C:\\checkout\\project'", "C:\\checkout")
		).toBe("Cannot read '<workspace>/project'");
		const form = new FormData();
		form.append("file", `@${fixturePath}`);
		const request = new Request("https://api.test/upload", {
			method: "POST",
			body: form,
		});
		request.headers.set("content-length", "1234");
		const recorded = await recordRequest(request);
		expect(recorded.body).toEqual([["file", "@<payload.txt>"]]);
		expect(recorded.headers["content-length"]).toBe("<multipart-length>");
	});

	it("records invalid JSON instead of changing the mock response to a 500", async () => {
		expect(
			(
				await recordRequest(
					new Request("https://api.test/items", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: "not json",
					})
				)
			).body
		).toEqual({ invalidJson: "not json" });
	});
});
