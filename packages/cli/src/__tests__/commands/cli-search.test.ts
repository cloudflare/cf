import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { searchKeywords } from "../../commands/cli/search-keywords.js";
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
		["list workers", "cf workers list"],
		["rotate turnstile secret", "cf turnstile widgets rotate-secret"],
		["create a secret in a secrets store", "cf secrets-store secrets create"],
		[
			"list secrets of a script in a dispatch namespace",
			"cf workers-for-platforms dispatch-namespaces scripts secrets list",
		],
		[
			"list scripts in a dispatch namespace",
			"cf workers-for-platforms dispatch-namespaces scripts list",
		],
		["list accounts in a tenant", "cf tenants accounts list"],
		["list D1 databases by usage", "cf d1 insights databases"],
		["apply D1 migrations", "cf d1 migrations apply"],
	])("keeps the top result for %j", async (query, expected) => {
		await runCf(["cli", "search", query]);
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command?.startsWith(expected)).toBe(true);
	});

	// Phrasings from search logs and Wrangler that need keywords.
	it.each([
		["set a secret on a worker", "cf workers secrets update"],
		["set worker secret", "cf workers secrets update"],
		["set a worker secret", "cf workers secrets update"],
		["set a secret for a worker", "cf workers secrets update"],
		["put worker secret", "cf workers secrets update"],
		["worker secret put", "cf workers secrets update"],
		["create worker secret", "cf workers secrets update"],
		["wrangler secret put", "cf workers secrets update"],
		["secret put", "cf workers secrets update"],
		["list worker secrets", "cf workers secrets list"],
		["list secrets of a worker script", "cf workers secrets list"],
		["list worker secret names", "cf workers secrets list"],
		["delete worker secret", "cf workers secrets delete"],
		["wrangler secret bulk", "cf workers secrets bulk"],
		["deploy worker with secrets file", "cf deploy"],
		["list worker scripts", "cf workers scripts search"],
		["list workers scripts in account", "cf workers scripts search"],
		["get worker script settings", "cf workers get"],
		["list accounts", "cf accounts list"],
		["get zero trust organization", "cf zero-trust organization get"],
		["list D1 databases", "cf d1 list"],
		["create a D1 database", "cf d1 create"],
		["query worker logs", "cf o11y telemetry query"],
	])("ranks %j to %s", async (query, expected) => {
		await runCf(["cli", "search", query]);
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command).toBe(expected);
	});
});

describe("search keywords for generated commands", () => {
	const words = (text: string) =>
		text
			.toLowerCase()
			.split(/[^\p{L}\p{N}]+/u)
			.filter(Boolean);

	it.each(Object.entries(searchKeywords))(
		"%s is a command and its keywords add words its path lacks",
		async (name, keywords) => {
			const metadata = await import(
				"../../commands/_generated/_meta/commands.json",
				{ with: { type: "json" } }
			);
			const command = (metadata.default.commands as CommandMeta[]).find(
				(entry) => entry.command === name
			);
			expect(command, `${name} is not a cf command`).toBeDefined();
			const pathWords = new Set(words(name));
			const repeated = keywords.flatMap(words).filter((w) => pathWords.has(w));
			expect(repeated).toEqual([]);
		}
	);
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
