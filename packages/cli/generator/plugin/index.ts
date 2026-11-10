/**
 * The CLI generator: a forge plugin that writes a yargs command for every
 * operation, in TypeScript, for cf.
 *
 * The commands follow forge's model: a command for each top-level group,
 * and a leaf command for each method, named in kebab-case. What each
 * command takes and sends is resolved from the method by the rules cf's
 * first generator followed when it read the OpenAPI document itself, in
 * `operation.ts` and `body.ts`, and how a typed call sends it, in
 * `operation.ts` too. The commands send their requests through cf's
 * runtime library, `#api` (`src/api/`), which the plugin doesn't write.
 *
 * forge calls the plugin once. It writes the files that list every command,
 * then each top-level group's command: what a command's files say depends
 * on its own operation alone.
 *
 * A plugin reads nothing but the document, so what else it needs is built
 * into it: `generator/index.ts`, its entry module, calls {@link cliPlugin}
 * with cf's hand-written commands and their metadata.
 */
import {
	definePlugin,
	type Exports,
	type File,
	type Forge,
	type Group,
} from "@cloudflare/forge/plugin";
import { command, commands, operationId, topLevel } from "./commands.js";
import { commandFiles, metadataFiles, type Operations } from "./files.js";
import { type Config, HandWritten } from "./hand-written.js";
import { resolve } from "./operation.js";

export type { Config, Sidecars } from "./hand-written.js";

/** The resolved operations of the methods of `groups`. */
function operations(groups: readonly Group[]): Operations {
	const ops: Operations = new Map();
	for (const group of groups) {
		for (const method of group.methods) {
			ops.set(operationId(method), resolve(method));
		}
	}
	return ops;
}

/**
 * Generates the files that list every one of cf's commands from `forge`,
 * with `config`: the root index and the metadata. The root's own methods
 * are left out, as {@link topLevel} says.
 */
export function generateCli(forge: Forge, config: Config): File[] {
	const groups = topLevel(forge).flatMap((group) => [
		group,
		...group.descendants,
	]);
	return metadataFiles(
		operations(groups),
		commands(forge),
		new HandWritten(config)
	);
}

/**
 * Generates the files of the command of the top-level group `group`, with
 * `config`: a module for each of its leaves, and an index for it and each
 * of its groups.
 */
export function generateCliGroup(group: Group, config: Config): File[] {
	const ops = operations([group, ...group.descendants]);
	return commandFiles(ops, command(group), new HandWritten(config));
}

/**
 * Generates every file of cf's commands from `forge`, with `config`: those
 * of {@link generateCli}, then those of {@link generateCliGroup} for each
 * top-level group.
 */
export function generateAll(forge: Forge, config: Config): File[] {
	return [
		...generateCli(forge, config),
		...topLevel(forge).flatMap((group) => generateCliGroup(group, config)),
	];
}

/** The exports of the plugin, which calls {@link generateAll}. */
export function cliPlugin(config: Config): Exports {
	return definePlugin({
		generate: (forge) => generateAll(forge, config),
	});
}
