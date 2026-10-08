/**
 * Runs the forge plugin that generates cf's commands on a small OpenAPI
 * document, so tests can check how it splices cf's hand-written commands
 * into the generated tree.
 */
import { execFileSync } from "node:child_process";
import {
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { handWrittenMeta } from "../../commands/hand-written-meta.js";
import {
	type HandWrittenCommand,
	type HandWrittenDryRunStrategy,
	handWrittenCommands,
	type LeafHandWrittenCommand,
} from "../../commands/hand-written.js";
import type { Config } from "../../../generator/plugin/index.js";
import type { CommandMeta } from "../../lib/metadata.js";

/**
 * The plugin the tests run. Building one takes seconds, and each test
 * generates with a configuration of its own, so it is built once, to read
 * its configuration from the document: the JSON in `info.version`, which
 * the plugin otherwise doesn't read. A group doesn't have the forge it is
 * in, so `generateGroup` reads it from the host.
 */
const require = createRequire(import.meta.url);
const forgeDir = dirname(require.resolve("@cloudflare/forge/package.json"));
const forgeBin = join(forgeDir, "bin", "forge.cjs");

/**
 * An absolute import specifier for an entry module in a temporary
 * directory, with the forward slashes bundlers take on Windows too.
 */
const specifier = (path: string) => JSON.stringify(path.split(sep).join("/"));

let testPlugin: string | undefined;
function plugin(): string {
	if (testPlugin === undefined) {
		const dir = mkdtempSync(join(tmpdir(), "cf-forge-plugin-"));
		process.on("exit", () => rmSync(dir, { recursive: true, force: true }));
		const entry = join(dir, "test-plugin.ts");
		writeFileSync(
			entry,
			[
				`import { definePlugin } from ${specifier(require.resolve("@cloudflare/forge/plugin"))};`,
				'import { info } from "forge:plugin/forge@0.2.0";',
				`import { generateCli, generateCliGroup } from ${specifier(fileURLToPath(new URL("../../../generator/plugin/index.ts", import.meta.url)))};`,
				"",
				"const config = () => JSON.parse(info().version);",
				"export const { generate, generateGroup } = definePlugin({",
				"\tgenerate: (forge) => generateCli(forge, config()),",
				"\tgenerateGroup: (group) => generateCliGroup(group, config()),",
				"});",
				"",
			].join("\n")
		);
		const wasm = join(dir, "test-plugin.wasm");
		execFileSync(
			process.execPath,
			[join(forgeDir, "bin", "forge-plugin.mjs"), "build", entry, "-o", wasm],
			{ stdio: "pipe" }
		);
		testPlugin = wasm;
	}
	return testPlugin;
}

/** Hand-written leaf commands added under `parent`. */
export function handWrittenLeafCommands(
	parent: string
): LeafHandWrittenCommand[] {
	return handWrittenCommands.filter(
		(command): command is LeafHandWrittenCommand =>
			command.kind === "leaf" && command.parent === parent
	);
}

/** Hand-written sub-groups added under `parent`. */
export function handWrittenSubGroups(parent: string): {
	name: string;
	dir: string;
	describe: string;
	dryRun: HandWrittenDryRunStrategy;
}[] {
	return handWrittenCommands.flatMap((command) =>
		command.kind === "subgroup" && command.parent === parent
			? [
					{
						name: command.name,
						dir: command.dir,
						describe: command.describe,
						dryRun: command.dryRun,
					},
				]
			: []
	);
}

/** The module an index imports the added leaf at `emitKey` from. */
export function handWrittenLeafCommandModule(
	emitKey: string
): string | undefined {
	const separator = emitKey.lastIndexOf("/");
	if (separator === -1) {
		return undefined;
	}
	const command = handWrittenLeafCommands(emitKey.slice(0, separator)).find(
		(entry) => entry.name === emitKey.slice(separator + 1)
	);
	return command === undefined
		? undefined
		: `#commands/${command.dir}/index.js`;
}

/** The description and visibility a hand-written entry gives `parent`. */
export function handWrittenParentOverrides(parent: string): {
	describe?: string;
	expose: boolean;
} {
	const override = handWrittenCommands.find(
		(command) => command.kind === "parentOverride" && command.parent === parent
	);
	return override?.kind === "parentOverride"
		? { describe: override.describe, expose: override.expose }
		: { describe: undefined, expose: false };
}

/** Normalizes a thrown value for reporting. */
export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

interface Operation {
	group: string[];
	name: string;
}

/**
 * Generates the commands for `operations`, with cf's hand-written entries
 * that `keep` selects, and returns the generated files, by path. Throws
 * with forge's message if it fails.
 */
function generate(
	operations: Operation[],
	keep: (entry: HandWrittenCommand) => boolean,
	extra: HandWrittenCommand[] = []
): (path: string) => string {
	const paths: Record<string, unknown> = {};
	operations.forEach((operation, index) => {
		paths[`/operations/${index}`] = {
			get: {
				operationId: `operation-${index}`,
				"x-fern-sdk-group-name": operation.group,
				"x-fern-sdk-method-name": operation.name,
				description: `Operation ${index}`,
				responses: {
					"200": {
						description: "OK",
						content: { "application/json": { schema: { type: "object" } } },
					},
				},
			},
		};
	});
	const config: Config = {
		handWritten: [...handWrittenCommands.filter(keep), ...extra],
		sidecars: handWrittenMeta,
	};
	const files = generateFiles(
		{
			openapi: "3.0.3",
			info: { title: "Test", version: "1" },
			paths,
			components: { schemas: {} },
		},
		config
	);
	return (path: string) => {
		const content = files.get(path);
		if (content === undefined) {
			throw new Error(`no ${path} in ${[...files.keys()].join(", ")}`);
		}
		return content;
	};
}

/** A configuration without hand-written commands. */
const EMPTY_CONFIG: Config = {
	handWritten: [],
	sidecars: { roots: {}, subgroups: {}, leaves: {}, leafOverrides: {} },
};

/**
 * Runs the plugin on the OpenAPI document `spec` with the configuration
 * `config`, as `generator/index.ts` builds it, or none, and returns the
 * files it generates, by path. Throws with forge's message if it fails.
 */
export function generateFiles(
	spec: { info: Record<string, unknown> } & Record<string, unknown>,
	config: Config = EMPTY_CONFIG
): Map<string, string> {
	const dir = mkdtempSync(join(tmpdir(), "cf-forge-cli-"));
	try {
		const doc = {
			...spec,
			info: { ...spec.info, version: JSON.stringify(config) },
		};
		writeFileSync(join(dir, "openapi.json"), JSON.stringify(doc));
		const wasm = plugin();
		try {
			execFileSync(
				process.execPath,
				[
					forgeBin,
					join(dir, "openapi.json"),
					"--target",
					`wasm://${wasm}`,
					"--out",
					join(dir, "out"),
				],
				{ stdio: "pipe" }
			);
		} catch (error) {
			const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
			throw new Error(stderr.replace(/^forge: /, "").trim());
		}
		const files = new Map<string, string>();
		const out = join(dir, "out");
		for (const entry of readdirSync(out, {
			recursive: true,
			withFileTypes: true,
		})) {
			if (entry.isFile()) {
				const path = join(entry.parentPath, entry.name);
				files.set(
					relative(out, path).split(sep).join("/"),
					readFileSync(path, "utf8")
				);
			}
		}
		return files;
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

function nameOf(group: string | { name: string }): string {
	return typeof group === "string" ? group : group.name;
}

/**
 * Generates a product `schema.name` with the leaves `commands` and the
 * groups `groups`, and returns its index.
 */
export function generateResourceIndexFile(
	schema: { name: string; description?: string },
	commands: string[],
	groups: (string | { name: string; commands?: string[] })[]
): string {
	const operations: Operation[] =
		schema.name === "access"
			? []
			: [
					...commands.map((name) => ({ group: [schema.name], name })),
					...groups.map((group) => ({
						group: [schema.name, nameOf(group)],
						name: "get",
					})),
				];
	const read = generate(
		operations,
		(entry) =>
			entry.kind === "parentOverride" ||
			(entry.kind === "leafOverride" &&
				entry.emitKey.startsWith(`${schema.name}/`)) ||
			((entry.kind === "leaf" || entry.kind === "subgroup") &&
				entry.parent === schema.name)
	);
	return read(`${schema.name}/index.ts`);
}

/**
 * Generates the group at `pathPrefix` with the leaves `commands` and the
 * subgroups `subGroups`, and returns its index.
 */
export function generateGroupIndexFile(
	_group: { name: string; description?: string; methods?: unknown[] },
	_resourceName: string,
	commands: string[],
	subGroups: { name: string }[] | undefined,
	pathPrefix: string
): string {
	const parent = pathPrefix.replace(/\/$/, "");
	const path = parent.split("/");
	const operations: Operation[] = [
		...commands.map((name) => ({ group: path, name })),
		...(subGroups ?? []).map((group) => ({
			group: [...path, group.name],
			name: "get",
		})),
	];
	if (operations.length === 0) {
		operations.push({ group: path, name: "placeholder" });
	}
	const read = generate(
		operations,
		(entry) => entry.kind === "leaf" && entry.parent === parent
	);
	return read(`${pathPrefix}index.ts`);
}

/**
 * Returns the metadata forge emits for the hand-written leaf `command`
 * registered under `parent`, after checking its sidecar against that
 * registration.
 */
export function readHandWrittenLeafCommandMeta(
	parent: string,
	command: Pick<LeafHandWrittenCommand, "name" | "dir">
): CommandMeta & { aliases?: string[] } {
	const path = parent.split("/");
	// forge always generates the Access root itself.
	const read = generate(
		path[0] === "access" ? [] : [{ group: path, name: "placeholder" }],
		() => false,
		// Every hand-written command chooses a dry-run strategy; which one
		// doesn't change its metadata.
		[
			{
				kind: "leaf",
				dryRun: "preview",
				parent,
				name: command.name,
				dir: command.dir,
			},
		]
	);
	const commands = (
		JSON.parse(read("_meta/commands.json")) as { commands: CommandMeta[] }
	).commands;
	const meta = commands.find(
		(entry) => entry.command === `cf ${[...path, command.name].join(" ")}`
	);
	if (meta === undefined) {
		throw new Error(`forge emitted no metadata for ${parent} ${command.name}`);
	}
	return meta;
}

/** Generates `resourceName` with the leaves `commands` registered. */
export function assertUniqueHandWrittenLeafCommandNames(
	resourceName: string,
	commands: readonly Pick<LeafHandWrittenCommand, "name" | "dir">[]
): void {
	generate(
		[{ group: [resourceName], name: "placeholder" }],
		() => false,
		commands.map((command) => ({
			kind: "leaf",
			dryRun: "preview",
			parent: resourceName,
			name: command.name,
			dir: command.dir,
		}))
	);
}
