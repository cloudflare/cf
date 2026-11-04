/**
 * Runs cf's command generator on a small OpenAPI document, so tests can
 * check how it splices cf's hand-written commands into the generated tree.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { type GeneratorConfig, runGenerator } from "../../../generator/run.js";
import { handWrittenMeta } from "../../commands/hand-written-meta.js";
import {
	type HandWrittenCommand,
	type HandWrittenDryRunStrategy,
	handWrittenCommands,
	type LeafHandWrittenCommand,
} from "../../commands/hand-written.js";
import type { CommandMeta } from "../../lib/metadata.js";

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
 * with the generator's message if it fails.
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
	const config: GeneratorConfig = {
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
const EMPTY_CONFIG: GeneratorConfig = {
	handWritten: [],
	sidecars: { roots: {}, subgroups: {}, leaves: {}, leafOverrides: {} },
};

/**
 * The environment Cargo runs in, as it was before any test stubbed `HOME`,
 * which rustup finds its toolchains through.
 */
const cargoEnv = { ...process.env };

/**
 * Runs the generator on the OpenAPI document `spec` with the hand-written
 * commands of `config`, or none, and returns the files it generates, by
 * path. Throws with the generator's message if it fails.
 */
export function generateFiles(
	spec: Record<string, unknown>,
	config: GeneratorConfig = EMPTY_CONFIG
): Map<string, string> {
	const out = mkdtempSync(join(tmpdir(), "cf-generator-out-"));
	try {
		try {
			runGenerator(spec, config, out, { env: cargoEnv, stdio: "pipe" });
		} catch (error) {
			const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
			throw new Error(stderr.replace(/^cf-generator: /, "").trim());
		}
		const files = new Map<string, string>();
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
		rmSync(out, { recursive: true, force: true });
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
 * Returns the metadata the generator emits for the hand-written leaf `command`
 * registered under `parent`, after checking its sidecar against that
 * registration.
 */
export function readHandWrittenLeafCommandMeta(
	parent: string,
	command: Pick<LeafHandWrittenCommand, "name" | "dir">
): CommandMeta & { aliases?: string[] } {
	const path = parent.split("/");
	// The generator always generates the Access root itself.
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
		throw new Error(
			`the generator emitted no metadata for ${parent} ${command.name}`
		);
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
