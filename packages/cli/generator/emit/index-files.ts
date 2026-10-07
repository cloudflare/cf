/**
 * Index-file emitters for resource directories (`dns/index.ts`) and
 * method-group directories (`dns/records/index.ts`).
 *
 * Both shapes are nearly identical — eager static imports of every
 * direct leaf and sub-group, registered with `yargs.command(…)` and
 * `demandCommand(1, "Please specify a subcommand")`. The distinct
 * message (matching the hand-written `auth`/`context` groups) lets the
 * top-level `.fail` handler tell a group invoked without a subcommand
 * (show help, exit 0) apart from a leaf invoked without its required
 * positional (yargs' default "Not enough non-option arguments" → a
 * non-zero usage error). The single {@link generateIndexFile} below
 * captures both via a small {@link IndexShape} discriminator; the
 * exported `generateResourceIndexFile` / `generateGroupIndexFile`
 * wrappers keep the existing public API.
 *
 * Lazy registration only happens at the OUTER `_generated/index.ts`
 * boundary (one `lazyCommand` per top-level product). Once the user
 * navigates into a product the entire product's command tree loads as
 * a single chunk.
 */
import { getSafeVarName } from "../codegen/identifiers.js";
import {
	handWrittenLeafCommandModule,
	handWrittenLeafCommands,
	handWrittenLeafOverrideModule,
	handWrittenParentOverrides,
	handWrittenSubGroups,
} from "../hand-written-overrides.js";
import { escapeForSingleQuote } from "../util.js";
import type { LeafHandWrittenCommand } from "../../src/commands/hand-written.js";
import type { HandWrittenDryRunStrategy } from "../../src/lib/hand-written-dry-run.js";
import type { Schema } from "@cloudflare/forge";

interface IndexShape {
	/** The command word that yargs registers (e.g. `dns` or `records`). */
	command: string;
	/** One-line summary; first line of the schema's description. */
	describe: string;
	/** Resource name that owns the overlay file — used in the header. */
	overlayResourceName: string;
	/** Top header line, e.g. "dns command" or "records command group". */
	headerLine: string;
	/** Direct leaf commands at this level (no trailing `/index.js`). */
	commands: readonly string[];
	/**
	 * Emit-path prefix of this directory (`dns/`, `dns/records/`). Used to
	 * look leaves up in the hand-written-override table, whose keys are
	 * full emit paths.
	 */
	pathPrefix: string;
	/**
	 * Sub-groups at this level; emitted as `import x from './x/index.js'`.
	 * The group object only needs a `name` — the leaf list is owned by
	 * the sub-group's own index file.
	 *
	 * A hand-written sub-group carries `dir` instead, and imports from
	 * `#commands/<dir>/index.js` since it lives outside `_generated/`.
	 * It must also choose a {@link HandWrittenDryRunStrategy}.
	 */
	subGroups: readonly (
		| { name: string; dir?: never; dryRun?: never }
		| { name: string; dir: string; dryRun: HandWrittenDryRunStrategy }
	)[];
}

function generateIndexFile(shape: IndexShape): string {
	const imports: string[] = [];
	const commandRegistrations: string[] = [];
	let wrapsHandWrittenCommand = false;

	for (const cmd of shape.commands) {
		const varName = getSafeVarName(cmd);
		const handWrittenLeaf = handWrittenLeafCommands(
			shape.pathPrefix.replace(/\/$/, "")
		).find((entry) => entry.name === cmd);
		// Hand-written overrides and added leaf commands live in
		// `src/commands/`, not next to the generated siblings, so they import
		// via `#commands/*`.
		const module =
			handWrittenLeafCommandModule(`${shape.pathPrefix}${cmd}`) ??
			handWrittenLeafOverrideModule(`${shape.pathPrefix}${cmd}`) ??
			`./${cmd}.js`;
		imports.push(`import ${varName} from '${module}';`);
		if (handWrittenLeaf !== undefined) {
			wrapsHandWrittenCommand = true;
			commandRegistrations.push(
				`    .command(withHandWrittenDryRun(${varName}, '${handWrittenLeaf.dryRun}'))`
			);
		} else {
			commandRegistrations.push(`    .command(${varName})`);
		}
	}

	for (const sg of shape.subGroups) {
		const varName = getSafeVarName(sg.name);
		// Hand-written sub-groups live in `src/commands/`, same as
		// hand-written leaves, so they import via `#commands/*`.
		const module =
			sg.dir === undefined
				? `./${sg.name}/index.js`
				: `#commands/${sg.dir}/index.js`;
		imports.push(`import ${varName} from '${module}';`);
		if (sg.dir !== undefined) {
			wrapsHandWrittenCommand = true;
			commandRegistrations.push(
				`    .command(withHandWrittenDryRun(${varName}, '${sg.dryRun}'))`
			);
		} else {
			commandRegistrations.push(`    .command(${varName})`);
		}
	}

	// Position-independent import root (package.json `#lib/*` → `src/lib/*`),
	// matching the per-command emitter — no `../` depth counting.
	const libPath = "#lib";

	return `/**
 * ${shape.headerLine}
 * @generated from apis/overlays/${shape.overlayResourceName}.ts
 */
import type { CommandModule } from 'yargs';
import type { CommonYargsOptions } from '${libPath}/cli-types.js';
${wrapsHandWrittenCommand ? `import { withHandWrittenDryRun } from '${libPath}/hand-written-dry-run.js';` : ""}
${imports.join("\n")}

const command: CommandModule<CommonYargsOptions> = {
  command: '${shape.command}',
  describe: '${escapeForSingleQuote(shape.describe)}',

  builder: (yargs) => {
    return yargs
${commandRegistrations.join("\n")}
    .demandCommand(1, "Please specify a subcommand");
  },

  handler: () => {},
};

export default command;
`;
}

/**
 * Generate the index file for a top-level resource (e.g. `dns/index.ts`).
 */
export function generateResourceIndexFile(
	schema: Schema.command,
	commands: string[],
	groups: { name: string; commands: string[] }[]
): string {
	// Hand-written leaf commands have no spec counterpart, so append them
	// alongside the direct leaves discovered by the spec walk.
	const handWrittenLeaves = handWrittenLeafCommands(schema.name);
	assertUniqueHandWrittenLeafCommandNames(schema.name, handWrittenLeaves);
	// Hand-written sub-groups have no spec counterpart, so they are
	// appended here rather than arriving from the method-group walk.
	const handWrittenGroups = handWrittenSubGroups(schema.name);
	for (const command of handWrittenLeaves) {
		if (
			commands.includes(command.name) ||
			groups.some((group) => group.name === command.name)
		) {
			throw new Error(
				`Hand-written leaf command "${schema.name} ${command.name}" collides with a command or group of the same name in the spec. ` +
					`Remove or update it in src/commands/hand-written.ts.`
			);
		}
		if (handWrittenGroups.some((group) => group.name === command.name)) {
			throw new Error(
				`Hand-written leaf command "${schema.name} ${command.name}" collides with a hand-written sub-group of the same name.`
			);
		}
	}
	for (const sg of handWrittenGroups) {
		if (
			commands.includes(sg.name) ||
			groups.some((group) => group.name === sg.name)
		) {
			// Both would emit `import $<name> …` into one file. Fail with the
			// cause rather than an opaque redeclaration error from the
			// TypeScript build: the spec has grown a command or group that the
			// hand-written entry was standing in for, so the entry should be
			// removed (or converted to a leaf override).
			throw new Error(
				`Hand-written sub-group "${schema.name} ${sg.name}" collides with a command or group of the same name in the spec. ` +
					`Remove or update it in src/commands/hand-written.ts.`
			);
		}
	}
	const directCommands = [
		...commands,
		...handWrittenLeaves.map((command) => command.name),
	].sort((a, b) => a.localeCompare(b));
	const subGroups = [...groups, ...handWrittenGroups].sort((a, b) =>
		a.name.localeCompare(b.name)
	);
	const parentOverrides = handWrittenParentOverrides(schema.name);
	return generateIndexFile({
		command: schema.name,
		describe:
			parentOverrides.describe ?? schema.description.split("\n")?.[0] ?? "",
		overlayResourceName: schema.name,
		headerLine: `${schema.name} command`,
		commands: directCommands,
		pathPrefix: `${schema.name}/`,
		subGroups,
	});
}

/** Fail before duplicate registrations become opaque import redeclarations. */
export function assertUniqueHandWrittenLeafCommandNames(
	resourceName: string,
	commands: readonly Pick<LeafHandWrittenCommand, "name" | "dir">[]
): void {
	const names = new Set<string>();
	for (const command of commands) {
		if (names.has(command.name)) {
			throw new Error(
				`Hand-written leaf command "${resourceName} ${command.name}" is registered more than once.`
			);
		}
		names.add(command.name);
	}
}

/**
 * Generate the index file for a method group (nested inside a resource).
 */
export function generateGroupIndexFile(
	group: Schema.methodGroup,
	resourceName: string,
	commands: string[],
	subGroups: { name: string }[] | undefined,
	pathPrefix: string
): string {
	const parent = pathPrefix.replace(/\/$/, "");
	const leaves = handWrittenLeafCommands(parent);
	assertUniqueHandWrittenLeafCommandNames(parent, leaves);
	for (const leaf of leaves) {
		if (
			commands.includes(leaf.name) ||
			subGroups?.some((group) => group.name === leaf.name)
		) {
			throw new Error(
				`Hand-written leaf command "${parent.replaceAll("/", " ")} ${leaf.name}" collides with a command or group of the same name in the spec. Remove or update it in src/commands/hand-written.ts.`
			);
		}
	}
	return generateIndexFile({
		command: group.name,
		describe: group.description,
		overlayResourceName: resourceName,
		headerLine: `${group.name} command group`,
		commands: [...commands, ...leaves.map((leaf) => leaf.name)].sort(),
		pathPrefix,
		subGroups: subGroups ?? [],
	});
}
