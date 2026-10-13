import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { CommandMeta, OptionMeta } from "../../lib/metadata.js";

export interface RegressionCase {
	name: string;
	args: string[];
	commandPath?: string[];
}

// These workflows need local project and credential setup that isn't useful
// for request-shape regression coverage. Every `cf access` command starts
// cloudflared.
export const excludedRoots = new Set([
	"access",
	"auth",
	"build",
	"deploy",
	"dev",
]);

// These commands would start Docker, SSH or cloudflared.
export const excludedCommands = new Set([
	"cf containers build",
	"cf containers push",
	"cf containers ssh",
	"cf tunnels diag",
	"cf tunnels login",
	"cf tunnels quick-start",
	"cf tunnels ready",
	"cf tunnels run",
	"cf tunnels tail",
]);

export const catalogue = JSON.parse(
	readFileSync(
		new URL("../../commands/_generated/_meta/commands.json", import.meta.url),
		"utf8"
	)
) as { commands: CommandMeta[]; descriptions: Record<string, string> };
catalogue.commands = catalogue.commands.filter(
	(command) =>
		!excludedRoots.has(command.fullPath[0] ?? "") &&
		!excludedCommands.has(command.command)
);

export const handwritten = new Map<string, { dir: string; overrides: boolean }>(
	(
		JSON.parse(
			readFileSync(
				new URL(
					"../../commands/_generated/_meta/hand-written-commands.json",
					import.meta.url
				),
				"utf8"
			)
		) as {
			commands: (CommandMeta & {
				handWritten: { dir: string; overrides: boolean };
			})[];
		}
	).commands.map((command) => [command.command, command.handWritten])
);

export function generatedSource(command: CommandMeta): string | undefined {
	if (handwritten.has(command.command)) {
		return undefined;
	}
	return readFileSync(
		new URL(
			`../../commands/_generated/${command.fullPath.join("/")}.ts`,
			import.meta.url
		),
		"utf8"
	);
}

export const fixturePath = fileURLToPath(
	new URL("./fixtures/payload.txt", import.meta.url)
);
export const jsonFixturePath = fileURLToPath(
	new URL("./fixtures/body.json", import.meta.url)
);

export const agentEnvironmentKeys = [
	...new Set(
		readFileSync(
			new URL("../../lib/agent-context.ts", import.meta.url),
			"utf8"
		).match(/"[A-Z][A-Z0-9_]+"/g)
	),
].map((key) => key.slice(1, -1));

const leafPaths = new Set(
	catalogue.commands.map((command) => command.fullPath.join(" "))
);
export const groups = [
	...new Set([
		"",
		...readdirSync(new URL("../../commands/_generated/", import.meta.url), {
			recursive: true,
			encoding: "utf8",
		})
			.filter((path) => path.endsWith(`${sep}index.ts`))
			.map((path) => path.slice(0, -"/index.ts".length).split(sep).join(" ")),
		...catalogue.commands.flatMap((command) =>
			command.fullPath
				.slice(0, -1)
				.map((_, index) => command.fullPath.slice(0, index + 1).join(" "))
		),
	]),
].filter(
	(path) => !leafPaths.has(path) && !excludedRoots.has(path.split(" ")[0] ?? "")
);

function value(
	name: string,
	type: string,
	choices?: unknown[],
	variant = 0
): string {
	if (choices?.length) {
		return String(choices[variant % choices.length]);
	}
	if (type === "boolean") {
		return variant ? "false" : "true";
	}
	if (type === "number") {
		return variant ? "2" : "1";
	}
	if (name === "database") {
		return "01234567-89ab-4cde-8123-456789abcdef";
	}
	if (name === "tunnel-id" || name === "connector-id") {
		return "01234567-89ab-4cde-8123-456789abcdef";
	}
	if (name === "image:tag" || name === "image" || name === "tag") {
		return "regression-image:latest";
	}
	if (name === "directory" || name === "path" || name === "dir") {
		return "project";
	}
	if (name === "pattern") {
		return "*.sql";
	}
	if (name === "table") {
		return "regression_migrations";
	}
	if (name === "worker") {
		return "regression-worker";
	}
	if (name === "secrets-file") {
		return "secrets.json";
	}
	if (name === "outfile") {
		return "regression.cpuprofile";
	}
	if (name === "extension") {
		return "com";
	}
	if (name === "contacts") {
		return '{"registrant":{"email":"regression@example.com"}}';
	}
	if (name === "shell") {
		return "bash";
	}
	if (name === "command") {
		return "zones";
	}
	if (/email/.test(name)) {
		return "regression@example.com";
	}
	if (/url|endpoint/.test(name)) {
		return "https://example.com/a?x=1&y=two";
	}
	if (/domain|hostname/.test(name)) {
		return "example.com";
	}
	if (/ip|address/.test(name)) {
		return "192.0.2.1";
	}
	if (/date|time/.test(name)) {
		return "2026-01-02T03:04:05Z";
	}
	if (/^zone$|id$|^worker$/.test(name)) {
		return "0123456789abcdef0123456789abcdef";
	}
	return variant ? "second value &/?+ü" : "regression value &/?+ü";
}

function tokens(
	option: OptionMeta,
	source: string | undefined,
	variant = 0
): string[] {
	const { name, type } = option;
	if (name === "file") {
		return ["--file", fixturePath];
	}
	if (name === "body") {
		return [
			"--body",
			variant
				? `@${jsonFixturePath}`
				: '{"regression":"body &/?+ü","items":[1,2]}',
		];
	}
	if (name === "dry-run") {
		return ["--dry-run"];
	}
	if (name === "help") {
		return ["--help"];
	}
	const jsonValue = source?.match(
		new RegExp(`argv\\["${name}"\\][^,]*,\\s*"${name}",\\s*"json"`)
	);
	const stringValue = /JSON array of objects/.test(option.description ?? "")
		? '[{"regression":"item"}]'
		: jsonValue
			? '{"regression":"json value"}'
			: value(name, type, option.enum, variant);
	const array = source
		?.match(
			new RegExp(`\\.option\\("${name}", \\{([\\s\\S]*?)\\n\\t\\t\\}\\)`)
		)?.[1]
		?.includes("array: true");
	return type === "boolean"
		? [`--${name}=${stringValue}`]
		: [
				`--${name}`,
				stringValue,
				...(array && variant ? [value(name, type, option.enum, 1)] : []),
			];
}

// Binary columns plus their complements cover all four presence/absence pairs.
// Singles also make a changed field easy to attribute in the snapshot diff.
export function presenceRows(size: number): boolean[][] {
	const rows: boolean[][] = [
		Array<boolean>(size).fill(false),
		Array<boolean>(size).fill(true),
	];
	for (let bit = 0; bit < Math.ceil(Math.log2(Math.max(size, 2))); bit++) {
		const row = Array.from({ length: size }, (_, index) =>
			Boolean(index & (1 << bit))
		);
		rows.push(
			row,
			row.map((present) => !present)
		);
	}
	return rows;
}

function withOptions(
	base: string[],
	options: OptionMeta[],
	source: string | undefined,
	variant = 0
): string[] {
	const args = [...base];
	for (const option of options) {
		const name = `--${option.name}`;
		const index = args.findIndex(
			(arg) => arg === name || arg.startsWith(`${name}=`)
		);
		if (index >= 0) {
			let end = index + 1;
			while (end < args.length && !args[end]?.startsWith("--")) {
				end++;
			}
			args.splice(index, end - index);
		}
		args.push(...tokens(option, source, variant));
	}
	return args;
}

const plans = new Map<CommandMeta, RegressionCase[]>();

export function commandCases(command: CommandMeta): RegressionCase[] {
	const cached = plans.get(command);
	if (cached) {
		return cached;
	}
	const source = generatedSource(command);
	const options = [...command.options];
	// Destructive flags are emitted by the generator but aren't all in metadata yet.
	if (
		source?.includes('.option("force",') &&
		!options.some((option) => option.name === "force")
	) {
		options.push({
			name: "force",
			type: "boolean",
			required: false,
			description: "Confirm operation",
		});
	}
	if (
		source?.includes('.option("text",') &&
		!options.some((option) => option.name === "text")
	) {
		options.push({
			name: "text",
			type: "boolean",
			required: false,
			description: "Decode raw response as text",
		});
	}
	const positional = [...command.arguments].sort(
		(a, b) => a.position - b.position
	);
	const base = positional.map((argument) =>
		value(argument.name, argument.type)
	);
	const required = options.filter(
		(option) => option.required && option.name !== "body"
	);
	base.push(...required.flatMap((option) => tokens(option, source)));
	if (options.some((option) => option.name === "force")) {
		base.push("--force");
	}
	if (
		command.hasRequestBody &&
		options.some((option) => option.name === "body")
	) {
		base.push(
			...tokens(
				options.find((option) => option.name === "body") as OptionMeta,
				source
			)
		);
	}
	const optional = options.filter(
		(option) =>
			!option.required &&
			!["force", "body", "file", "dry-run", "help"].includes(option.name)
	);
	const flagBase = base.slice(
		0,
		base.indexOf("--body") < 0 ? base.length : base.indexOf("--body")
	);
	const conditionalFields = [
		...(source?.matchAll(
			/"(--[^"\n]+) are required when any --[^"\n]+ flag is set"/g
		) ?? []),
	].flatMap((match) =>
		[...(match[1]?.matchAll(/--([a-zA-Z0-9.-]+)/g) ?? [])].map(
			(field) => field[1]
		)
	);
	for (const name of new Set(conditionalFields)) {
		const option = options.find((candidate) => candidate.name === name);
		if (option && !flagBase.includes(`--${name}`)) {
			flagBase.push(...tokens(option, source));
		}
	}
	// Raw --body bypasses field flags. Use a separate base so the option matrix
	// actually tests the per-field serializer instead of resending one raw body.
	const matrixBase = source?.includes(
		"// Assemble request body from individual flags"
	)
		? flagBase
		: base;
	const cases: RegressionCase[] = [
		{ name: "no-args", args: [] },
		{ name: "required", args: base },
	];
	for (const option of optional) {
		cases.push({
			name: `only --${option.name}`,
			args: withOptions(matrixBase, [option], source),
		});
		for (
			let variant = 1;
			variant <
			Math.max(option.type === "boolean" ? 2 : 1, option.enum?.length ?? 0);
			variant++
		) {
			cases.push({
				name: `--${option.name} value ${variant}`,
				args: withOptions(matrixBase, [option], source, variant),
			});
		}
	}
	for (const option of required) {
		for (
			let variant = 1;
			variant <
			Math.max(option.type === "boolean" ? 2 : 1, option.enum?.length ?? 0);
			variant++
		) {
			cases.push({
				name: `required --${option.name} value ${variant}`,
				args: withOptions(base, [option], source, variant),
			});
		}
	}
	presenceRows(optional.length).forEach((row, index) => {
		cases.push({
			name: `pairwise ${index}`,
			args: withOptions(
				matrixBase,
				optional.filter((_, column) => row[column]),
				source,
				index % 2
			),
		});
	});
	for (const [name, args] of [
		["global quiet", ["--quiet"]],
		["global zone", ["--zone", "abcdef0123456789abcdef0123456789"]],
		[
			"global profile and mode",
			["--profile", "default", "--mode", "regression"],
		],
		["local", ["--local"]],
		["local with persistence", ["--local", "--persist-to", "regression-state"]],
	] as const) {
		cases.push({ name, args: [...base, ...args] });
	}
	if (
		command.apiPath?.includes("zone_id") ||
		source?.includes("accountOrZone")
	) {
		const domain = `regression-${createHash("sha256").update(command.command).digest("hex").slice(0, 12)}.example.com`;
		cases.push({ name: "zone by domain", args: [...base, "--zone", domain] });
	}
	if (options.some((option) => option.name === "dry-run")) {
		cases.push({ name: "dry-run", args: [...base, "--dry-run"] });
	}
	if (options.some((option) => option.name === "body")) {
		const withoutBody = base.slice(
			0,
			base.indexOf("--body") < 0 ? base.length : base.indexOf("--body")
		);
		cases.push({
			name: "body from file",
			args: [...withoutBody, "--body", `@${jsonFixturePath}`],
		});
		cases.push({
			name: "array body",
			args: [
				...withoutBody,
				"--body",
				'[{"regression":"first"},{"regression":"second"}]',
			],
		});
		// Exercise derived body flags without the raw-body escape hatch.
		cases.push({
			name: "field flags",
			args: withOptions(flagBase, optional, source),
		});
	}
	if (options.some((option) => option.name === "file")) {
		const bodyIndex = base.indexOf("--body");
		cases.push({
			name: "binary file",
			args: [
				...(bodyIndex < 0 ? base : base.slice(0, bodyIndex)),
				"--file",
				fixturePath,
			],
		});
	}
	for (const argument of positional) {
		const alternate = [...base];
		alternate[argument.position] = value(
			argument.name,
			argument.type,
			undefined,
			1
		);
		cases.push({ name: `alternate <${argument.name}>`, args: alternate });
	}
	const canonicalCases = [...cases];
	for (const alias of command.aliases ?? []) {
		for (const scenario of canonicalCases) {
			cases.push({
				name: `alias ${alias}: ${scenario.name}`,
				args: scenario.args,
				commandPath: [...command.fullPath.slice(0, -1), alias],
			});
		}
	}
	const seen = new Set<string>();
	const planned = cases.filter((scenario) => {
		const key = JSON.stringify([scenario.commandPath, scenario.args]);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
	plans.set(command, planned);
	return planned;
}

export const SHARDS = 12;

// Keep each product's imports warm and balance by case count, not command count.
let assignedCommands: CommandMeta[][] | undefined;

export function shardCommands(): CommandMeta[][] {
	if (assignedCommands) {
		return assignedCommands;
	}
	const roots = new Map<string, CommandMeta[]>();
	for (const command of catalogue.commands) {
		const root = command.fullPath[0] as string;
		roots.set(root, [...(roots.get(root) ?? []), command]);
	}
	const buckets = Array.from({ length: SHARDS }, () => ({
		weight: 0,
		commands: [] as CommandMeta[],
	}));
	const productGroups = [...roots.values()].map((commands) => ({
		commands,
		weight: commands.reduce(
			(sum, command) => sum + commandCases(command).length,
			0
		),
	}));
	for (const group of productGroups.sort((a, b) => b.weight - a.weight)) {
		const bucket = buckets.reduce((a, b) => (a.weight <= b.weight ? a : b));
		bucket.commands.push(...group.commands);
		bucket.weight += group.weight;
	}
	assignedCommands = buckets.map((bucket) => bucket.commands);
	return assignedCommands;
}

export function shardGroups(shard: number): string[] {
	const assignments = new Map(
		shardCommands().flatMap((commands, index) =>
			commands.map((command) => [command.fullPath[0], index] as const)
		)
	);
	return groups.filter((group) => {
		const root = group.split(" ")[0] ?? "";
		const fallback =
			root
				.split("")
				.reduce(
					(hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
					0
				) % SHARDS;
		return (assignments.get(root) ?? fallback) === shard;
	});
}
