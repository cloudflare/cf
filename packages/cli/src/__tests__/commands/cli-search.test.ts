import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { searchCommands } from "../../commands/cli/search.js";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";
import type { CommandMeta } from "../../lib/metadata.js";

describe("cf cli search", () => {
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns five ranked JSON results with only command and summary", async () => {
		expect(await runCf(["cli", "search", "list zones"])).toEqual({
			exitCode: 0,
		});
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results).toHaveLength(5);
		expect(results[0]).toEqual({
			command: "cf zones list",
			summary: "List Zones",
		});
		for (const result of results) {
			expect(Object.keys(result).sort()).toEqual(["command", "summary"]);
		}
	});

	it("matches commands by name and by description", async () => {
		expect(
			await runCf(["cli", "search", "abuse-reports appeals eligibility"])
		).toEqual({ exitCode: 0 });
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command).toBe("cf abuse-reports appeals eligibility");
		output.clear();
		await runCf(["cli", "search", "mitigation appeal could reverse"]);
		const byDescription = JSON.parse(output.stdout()) as Record<
			string,
			string
		>[];
		expect(byDescription[0]?.command).toBe(
			"cf abuse-reports appeals eligibility"
		);
	});

	it.each([
		"deploy a page",
		"deploy pages project",
		"deploy static site",
		"deploy full stack app",
		"deploy my site",
		"deploy website",
		"pages deploy",
	])("ranks cf deploy first for %j", async (query) => {
		await runCf(["cli", "search", query]);
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command).toBe("cf deploy");
		expect(results.map((r) => r.command)).not.toContain("cf pages deploy");
	});

	// These share "deploy" with cf deploy but name a resource it cannot deploy.
	it.each([
		"deploy firewall rule",
		"deploy origin certificate",
		"deploy certificate",
		"deploy turnstile",
		"deploy snippets",
		"deploy spectrum application",
	])("does not rank cf deploy first for %j", async (query) => {
		await runCf(["cli", "search", query]);
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command).not.toBe("cf deploy");
	});

	it.each([
		["create kv namespace", "cf kv namespaces create"],
		["dns record", "cf dns records"],
	])("keeps the top result for %j", async (query, expected) => {
		await runCf(["cli", "search", query]);
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command?.startsWith(expected)).toBe(true);
	});
});

describe("searchCommands", () => {
	function command(
		path: string,
		description: string,
		extra: Partial<CommandMeta> = {}
	): CommandMeta {
		const fullPath = path.split(" ");
		return {
			command: `cf ${path}`,
			name: fullPath.at(-1) ?? path,
			fullPath,
			description,
			usage: `cf ${path}`,
			arguments: [],
			options: [],
			...extra,
		};
	}

	function search(commands: CommandMeta[], query: string): string[] {
		return searchCommands(
			{ version: "1.0", generatedAt: "build-time", commands },
			query
		).map((result) => result.command);
	}

	it("leaves out hidden commands", () => {
		expect(
			search(
				[
					command("ready get", "Run readiness checks", { hideCommand: true }),
					command("health list", "List readiness checks"),
				],
				"readiness checks"
			)
		).toEqual(["cf health list"]);
	});

	it("leaves out commands whose sidecar excludes them", () => {
		expect(
			search(
				[
					command("old deploy", "Deploy static assets", {
						search: { exclude: true },
					}),
					command("deploy", "Deploy a project"),
				],
				"deploy static assets"
			)
		).toEqual(["cf deploy"]);
	});

	it("matches keywords the description does not mention", () => {
		expect(
			search(
				[
					command("deploy", "Deploy a project", {
						search: { keywords: ["website"] },
					}),
					command("zones list", "List zones"),
				],
				"website"
			)
		).toEqual(["cf deploy"]);
	});
});
