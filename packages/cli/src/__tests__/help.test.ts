import chalk from "chalk";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { appendApiSchemaHelp } from "../commands/api-schema-help.js";
import { buildCli } from "../index.js";
import { theme } from "../lib/ui/theme.js";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";

const agentDetection = vi.hoisted(() => ({ isAgentic: false }));

vi.mock("../lib/agent-context.js", () => ({
	detectAgentContext: () => ({
		isAgentic: agentDetection.isAgentic,
		harness: null,
		model: null,
		sessionId: null,
		invocationId: null,
		matches: [],
	}),
}));

describe("help formatting", () => {
	const originalColumns = process.stdout.columns;

	afterEach(() => {
		process.stdout.columns = originalColumns;
		agentDetection.isAgentic = false;
		vi.restoreAllMocks();
	});

	it("uses the available terminal width for command descriptions", async () => {
		process.stdout.columns = 160;

		const help = await buildCli(["workers", "--help"]).cli.getHelp();
		const triggersLine = help
			.split("\n")
			.find((line) => line.includes("Manage triggers"));

		expect(triggersLine).toContain("cf workers triggers");
		expect(triggersLine).toContain("Cron triggers etc.)");
	});

	it("falls back to 80 columns when the terminal reports zero", async () => {
		process.stdout.columns = 0;

		const help = await buildCli(["workers", "--help"]).cli.getHelp();
		const triggersLine = help
			.split("\n")
			.find((line) => line.includes("Manage triggers"));

		expect(triggersLine).toContain("cf workers triggers");
		expect(triggersLine).not.toContain("etc.)");
		expect(
			help.split("\n").some((line) => line.trim().endsWith("triggers etc.)"))
		).toBe(true);
	});

	it("sorts root commands alphabetically", async () => {
		const help = await buildCli(["--help"]).cli.getHelp();

		expect(help.indexOf("cf pipelines")).toBeLessThan(
			help.indexOf("cf previews")
		);
		expect(help.indexOf("cf previews")).toBeLessThan(help.indexOf("cf r2"));
	});

	it.each([
		["root", ["--help"]],
		["group", ["zones", "--help"]],
		["leaf", ["zones", "list", "--help"]],
		["local command", ["cli", "search", "--help"]],
	])("puts agent discovery before %s help for agents", async (_name, args) => {
		agentDetection.isAgentic = true;
		const help = await buildCli(args).cli.getHelp();
		expect(help).toMatch(/^=== STOP: AGENT COMMAND DISCOVERY ===\n/);
		expect(help).toContain("cf cli search");
		expect(help).toContain(
			"Keep cf cli search queries anonymous; describe the action and resource type only."
		);
		expect(help).toContain(
			"Never include names, email addresses, domains, account or resource IDs, tokens, or other identifying values."
		);
		expect(help).toContain(
			"Run `<discovered command> --help` for detailed command help."
		);
		expect(help).toContain(
			"For API request details, replace the result's leading `cf` with `cf schema`."
		);
		expect(help).not.toContain("cf schema <discovered command>");
	});

	it.each([
		["root", ["--help"]],
		["group", ["zones", "--help"]],
		["leaf", ["zones", "list", "--help"]],
	])("omits agent discovery from %s help for people", async (_name, args) => {
		const help = await buildCli(args).cli.getHelp();
		expect(help).not.toContain("AGENT COMMAND DISCOVERY");
	});

	it("prints the notice when yargs renders --help for an agent", async () => {
		agentDetection.isAgentic = true;
		const output = captureOutput();
		expect(await runCf(["zones", "list", "--help"])).toEqual({
			exitCode: 0,
		});
		expect(output.stdout()).toMatch(/^=== STOP: AGENT COMMAND DISCOVERY ===\n/);
	});

	it("omits the notice when yargs renders --help for a person", async () => {
		const output = captureOutput();
		expect(await runCf(["zones", "list", "--help"])).toEqual({
			exitCode: 0,
		});
		expect(output.stdout()).not.toContain("AGENT COMMAND DISCOVERY");
	});

	it.each([
		["generated", ["zones", "list", "--help"], "zones list"],
		[
			"hidden",
			["abuse-reports", "appeals", "eligibility", "--help"],
			"abuse-reports appeals eligibility",
		],
		[
			"spec-backed override",
			["registrar", "registrations", "create", "--help"],
			"registrar registrations create",
		],
	])("adds a schema suffix to %s API help", async (_name, args, command) => {
		const help = await buildCli(args).cli.getHelp();
		expect(help).toMatch(
			new RegExp(`To inspect the exact API request, run cf schema ${command}$`)
		);
	});

	it.each([
		["root", ["--help"]],
		["API group", ["zones", "--help"]],
		["local command", ["cli", "search", "--help"]],
		["hand-written workflow", ["deploy", "--help"]],
	])("omits the schema suffix from %s help", async (_name, args) => {
		const help = await buildCli(args).cli.getHelp();
		expect(help).not.toContain("To inspect the exact API request");
	});

	it("prints the schema suffix in command --help", async () => {
		const output = captureOutput();
		expect(await runCf(["zones", "list", "--help"])).toEqual({
			exitCode: 0,
		});
		expect(output.stdout().trimEnd()).toMatch(
			/To inspect the exact API request, run cf schema zones list$/
		);
	});

	it("italicizes the API hint and colors the schema command when enabled", () => {
		const previousLevel = chalk.level;
		try {
			chalk.level = 1;
			const colored = appendApiSchemaHelp("Help", "kv namespaces create");
			expect(colored).toContain("\u001b[3m");
			expect(colored).toContain(theme.code("cf schema kv namespaces create"));

			chalk.level = 0;
			expect(appendApiSchemaHelp("Help", "kv namespaces create")).toBe(
				"Help\n\nTo inspect the exact API request, run cf schema kv namespaces create"
			);
		} finally {
			chalk.level = previousLevel;
		}
	});
});
