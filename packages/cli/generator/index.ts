import {
	leafOverrideHandWrittenCommands,
	leafHandWrittenCommands,
	parentOverrideHandWrittenCommands,
	rootCommandName,
	rootHandWrittenCommands,
	subGroupHandWrittenCommands,
} from "../src/commands/hand-written.js";
import { withHandWrittenCommandRoots } from "./command-roots.js";
import {
	generateCommandFile,
	generateGroupIndexFile,
	generateResourceIndexFile,
	isMethodGroup,
} from "./generator";
import {
	handWrittenLeafCommands,
	handWrittenLeafOverrideDir,
	handWrittenParentOverrides,
	handWrittenSubGroups,
	readHandWrittenCommandListMeta,
	readHandWrittenLeafCommandMeta,
	readHandWrittenLeafOverrideMeta,
} from "./hand-written-overrides.js";
import {
	generateCommandMeta,
	generateMetadataFile,
	generateSchemaFile,
	generateSchemaInfo,
	type HandWrittenCommandMeta,
	type SchemaInfo,
} from "./metadata";
import { errorMessage, escapeForSingleQuote } from "./util.js";
/**
 * CLI Transformer
 *
 * Generates Yargs command files and shell completion scripts from overlay definitions.
 * Output: emitted via forge.emit() for src/commands/_generated/
 * Side-effect: completion scripts still written directly to src/lib/completions/
 */
import type {
	CommandMeta,
	Forge,
	Schema,
	TransformerFn,
} from "@cloudflare/forge";

/**
 * Check whether a method group has any non-deprecated content (direct or
 * transitively nested). Used to prune groups that would otherwise emit an
 * empty index.ts.
 */
function hasNonDeprecatedContent(group: Schema.methodGroup): boolean {
	for (const child of group.methods) {
		if (isMethodGroup(child)) {
			if (hasNonDeprecatedContent(child)) return true;
		} else if (child.status !== "deprecated") {
			return true;
		}
	}
	return false;
}

/**
 * Emit a leaf command file: run `generateCommandFile`, capture
 * meta + schema info into the global accumulators, and
 * write the .ts via `forge.emit`. Errors from `generateCommandFile`
 * are collected into `generationErrors` so the whole generate pass
 * can report them in one shot at the end.
 *
 * Used by both the top-level direct-command path and the nested
 * group-walk path in `processMethodGroup`; the only callsite-specific
 * data is the group path (when nested), the parent's `hideCommand`
 * flag, the emit path, and the leaf-name accumulator.
 *
 * Leaves listed in the hand-written-override table emit no file — the
 * generated index imports `src/commands/<dir>/index.ts` instead — but
 * still contribute metadata (from the hand-authored sidecar) and schema
 * info (derived from the spec, which is what the drift guards compare
 * the hand-written command against).
 */
function emitLeafCommand(
	forge: Forge,
	method: Schema.method,
	resourceName: string,
	groupPath: string | undefined,
	hideCommand: boolean | undefined,
	emitPath: string,
	leafCommands: string[],
	allCommandMeta: CommandMeta[],
	allSchemaInfo: Map<string, SchemaInfo>,
	generationErrors: string[]
): void {
	const overrideDir = handWrittenLeafOverrideDir(emitPath.replace(/\.ts$/, ""));
	let code: string | undefined;
	let meta: CommandMeta;
	try {
		if (overrideDir === undefined) {
			const result = generateCommandFile(
				method,
				resourceName,
				groupPath,
				hideCommand
			);
			code = result.code;
			meta = result.meta;
		} else {
			// Spec-derived metadata, with the sidecar overriding only what the
			// hand-written command actually changes (usage, flags, prose). The
			// operation's identity — path, verb, operationId — stays derived,
			// so it can't drift out of the sidecar.
			meta = {
				...generateCommandMeta(method, resourceName, groupPath, hideCommand),
				...readHandWrittenLeafOverrideMeta(overrideDir),
			};
		}
	} catch (e) {
		generationErrors.push((e as Error).message);
		return;
	}
	allCommandMeta.push(meta);
	const schemaInfo = generateSchemaInfo(method, resourceName, groupPath);
	if (schemaInfo) {
		// Top-level: "${product} ${method}"
		// Nested:    "${product} ${groupPath-with-slashes-as-spaces} ${method}"
		const commandPath =
			groupPath === undefined
				? `${resourceName} ${method.name}`
				: `${resourceName} ${groupPath.replace(/\//g, " ")} ${method.name}`;
		allSchemaInfo.set(commandPath, schemaInfo);
	}
	if (code !== undefined) {
		forge.emit(emitPath, code);
	}
	leafCommands.push(method.name);
}

/**
 * Recursively process a method group: generate leaf command files and recurse
 * into nested sub-groups. Returns the list of direct leaf command names and
 * nested sub-group names. Files are emitted directly via forge.emit().
 *
 * @param forge The Forge instance for emitting files
 * @param group The method group to process
 * @param pathPrefix Relative path prefix for generated files (e.g. 'access/applications/')
 * @param resourceName Top-level resource name (e.g. 'access')
 * @param groupPath Slash-separated path of group names from resource root (e.g. 'applications/cas')
 * @param hideCommand Whether the parent command is hidden
 * @param displayPath Human-readable path for console output (e.g. 'access/applications/cas')
 * @param allCommandMeta Accumulator for all command metadata
 * @param allSchemaInfo Accumulator for schema info
 * @param generationErrors Accumulator for generation errors
 */
async function processMethodGroup(
	forge: Forge,
	group: Schema.methodGroup,
	pathPrefix: string,
	resourceName: string,
	groupPath: string,
	hideCommand: boolean | undefined,
	displayPath: string,
	allCommandMeta: CommandMeta[],
	allSchemaInfo: Map<string, SchemaInfo>,
	generationErrors: string[]
): Promise<{ commands: string[]; subGroups: { name: string }[] }> {
	const leafCommands: string[] = [];
	const subGroups: { name: string }[] = [];
	const tasks: Promise<void>[] = [];
	const leafNames = new Set(
		group.methods
			.filter((child) => !isMethodGroup(child) && child.status !== "deprecated")
			.map((child) => child.name)
	);

	for (const child of group.methods) {
		// Skip methods whose forge status is `deprecated`. cf is a thin shell
		// over the live OpenAPI spec, but deprecated ops clutter help and
		// encourage users to adopt paths that will break at their sunset date.
		if (!isMethodGroup(child) && child.status === "deprecated") continue;
		// A command name cannot be both an executable leaf and a group. Prefer
		// the leaf and drop the nested group, matching the SDK collision policy.
		if (isMethodGroup(child) && leafNames.has(child.name)) {
			console.warn(
				`[cf-generator] Dropping ${displayPath}/${child.name} group because a leaf command has the same name`
			);
			continue;
		}
		// Skip groups that contain only deprecated methods (otherwise we'd
		// emit an empty bulk-deprecated/index.ts).
		if (isMethodGroup(child) && !hasNonDeprecatedContent(child)) continue;
		if (isMethodGroup(child)) {
			// Nested sub-group — recurse into a subdirectory
			const childPathPrefix = `${pathPrefix}${child.name}/`;
			const childGroupPath = `${groupPath}/${child.name}`;
			const childDisplayPath = `${displayPath}/${child.name}`;

			tasks.push(
				(async () => {
					const result = await processMethodGroup(
						forge,
						child,
						childPathPrefix,
						resourceName,
						childGroupPath,
						hideCommand,
						childDisplayPath,
						allCommandMeta,
						allSchemaInfo,
						generationErrors
					);

					// Generate the sub-group's index.ts (unformatted — formatting runs as a post-step)
					const subGroupIndex = generateGroupIndexFile(
						child,
						resourceName,
						result.commands,
						result.subGroups,
						childPathPrefix
					);
					forge.emit(`${childPathPrefix}index.ts`, subGroupIndex);

					subGroups.push({ name: child.name });
					const totalLeafs = result.commands.length + result.subGroups.length;
					console.log(
						`    ✅ Generated ${childDisplayPath}/ (${totalLeafs} entries)`
					);
				})()
			);
		} else {
			// Leaf method — generate a .ts command file
			tasks.push(
				(async () => {
					emitLeafCommand(
						forge,
						child,
						resourceName,
						groupPath,
						hideCommand,
						`${pathPrefix}${child.name}.ts`,
						leafCommands,
						allCommandMeta,
						allSchemaInfo,
						generationErrors
					);
				})()
			);
		}
	}

	await Promise.all(tasks);
	for (const command of handWrittenLeafCommands(
		pathPrefix.replace(/\/$/, "")
	)) {
		try {
			const meta = readHandWrittenLeafCommandMeta(command.parent, command);
			allCommandMeta.push(meta);
		} catch (error) {
			generationErrors.push(errorMessage(error));
		}
	}

	leafCommands.sort();
	subGroups.sort((a, b) => a.name.localeCompare(b.name));

	return { commands: leafCommands, subGroups };
}

export const transformer: TransformerFn = async (forge: Forge) => {
	// All mutable state is local to this invocation
	const allSchemas: Schema.command[] = [];
	const allCommandMeta: CommandMeta[] = [];
	const allSchemaInfo = new Map<string, SchemaInfo>();
	const generationErrors: string[] = [];

	// --- Generate CLI commands for all APIs ---
	if (forge.commands.has("access")) {
		throw new Error("The synthetic Access root collides with a Forge command.");
	}
	// Access is a local CLI command group, independent of the OpenAPI roots.
	const accessSchema: Schema.command = {
		name: "access",
		description: "Access protected applications and services",
		methods: [],
		globalCliArgs: [],
		hideCommand: false,
	};
	const commandSchemas: Array<[string, Schema.command]> = [
		...withHandWrittenCommandRoots(
			forge.commands,
			parentOverrideHandWrittenCommands()
		),
		["access", accessSchema],
	];

	for (const [name, schema] of commandSchemas) {
		console.log(`  Generating CLI commands for: ${name}`);
		const parentOverrides = handWrittenParentOverrides(name);
		const hideCommand = schema.hideCommand && !parentOverrides.expose;

		allSchemas.push(schema);

		const directCommands: string[] = [];
		const groups: { name: string; commands: string[] }[] = [];
		const directCommandNames = new Set(
			schema.methods
				.filter((item) => !isMethodGroup(item) && item.status !== "deprecated")
				.map((item) => item.name)
		);

		// Generate command files in parallel
		const tasks: Promise<void>[] = [];

		for (const item of schema.methods) {
			// Skip top-level deprecated methods (see processMethodGroup for the
			// nested counterpart).
			if (!isMethodGroup(item) && item.status === "deprecated") continue;
			if (isMethodGroup(item) && directCommandNames.has(item.name)) {
				console.warn(
					`[cf-generator] Dropping ${name}/${item.name} group because a leaf command has the same name`
				);
				continue;
			}
			// Skip groups that contain only deprecated methods.
			if (isMethodGroup(item) && !hasNonDeprecatedContent(item)) continue;
			if (isMethodGroup(item)) {
				// Method group — recursively process into subdirectory
				const groupPathPrefix = `${name}/${item.name}/`;

				tasks.push(
					(async () => {
						const result = await processMethodGroup(
							forge,
							item,
							groupPathPrefix,
							name,
							item.name, // groupPath: just the group name at the first level
							hideCommand,
							`${name}/${item.name}`,
							allCommandMeta,
							allSchemaInfo,
							generationErrors
						);

						// Generate group index (unformatted — formatting runs as a post-step)
						const groupIndex = generateGroupIndexFile(
							item,
							name,
							result.commands,
							result.subGroups,
							groupPathPrefix
						);
						forge.emit(`${groupPathPrefix}index.ts`, groupIndex);

						groups.push({ name: item.name, commands: result.commands });
						const totalEntries =
							result.commands.length + result.subGroups.length;
						console.log(
							`    ✅ Generated ${name}/${item.name}/ (${totalEntries} entries)`
						);
					})()
				);
			} else {
				// Direct command
				tasks.push(
					(async () => {
						emitLeafCommand(
							forge,
							item,
							name,
							undefined,
							hideCommand,
							`${name}/${item.name}.ts`,
							directCommands,
							allCommandMeta,
							allSchemaInfo,
							generationErrors
						);
					})()
				);
			}
		}

		await Promise.all(tasks);
		directCommands.sort();
		groups.sort((a, b) => a.name.localeCompare(b.name));

		// Generate resource index file (unformatted)
		const indexCode = generateResourceIndexFile(schema, directCommands, groups);
		forge.emit(`${name}/index.ts`, indexCode);

		// Added hand-written leaves are absent from the spec walk above, so their
		// complete identity and option metadata comes from their sidecars.
		// Feed it into every generated metadata consumer, just like
		// hand-written sub-group leaves below.
		const handWrittenLeaves = handWrittenLeafCommands(name);
		for (const command of handWrittenLeaves) {
			try {
				allCommandMeta.push(readHandWrittenLeafCommandMeta(name, command));
			} catch (e) {
				generationErrors.push((e as Error).message);
			}
		}

		// Hand-written sub-groups are absent from the spec walk above, so
		// their leaves' metadata comes from the sidecar rather than from a
		// `method`. Without this they would work at the CLI but be invisible
		// to `_meta/commands.json` — and so to completions and `cf tools`.
		for (const sg of handWrittenSubGroups(name)) {
			try {
				allCommandMeta.push(...readHandWrittenCommandListMeta(sg.dir));
			} catch (e) {
				generationErrors.push((e as Error).message);
			}
		}

		console.log(
			`    ✅ Generated ${name}/index.ts (${directCommands.length + handWrittenLeaves.length} direct commands, ${groups.length} groups)`
		);
	}

	// --- Finalize: create main index and metadata ---

	if (allSchemas.length === 0) {
		console.log("  ⚠️  No schemas to generate CLI index for");
		return;
	}

	console.log("  Generating CLI main index...");

	const rootCommandMeta: CommandMeta[] = [];
	const productNames = new Set(allSchemas.map((schema) => schema.name));
	for (const command of rootHandWrittenCommands()) {
		const root = rootCommandName(command);
		if (productNames.has(root)) {
			generationErrors.push(
				`Root hand-written command "${root}" collides with a generated product of the same name.`
			);
			continue;
		}
		try {
			for (const meta of readHandWrittenCommandListMeta(command.dir)) {
				rootCommandMeta.push(meta);
				allCommandMeta.push(meta);
			}
		} catch (e) {
			generationErrors.push((e as Error).message);
		}
	}

	allSchemas.sort((a, b) => a.name.localeCompare(b.name));
	allCommandMeta.sort((a, b) => a.command.localeCompare(b.command));

	// Lazy-register every product. Each entry is a `lazyCommand` shell
	// whose builder/handler dynamically import the product's index on
	// demand, so `cf --help`, splash, version, and any single-product
	// invocation only load the chain of modules they actually need.
	// Generated leaves report their own telemetry; group help is reported by
	// the entrypoint after yargs renders it.
	const entries = allSchemas
		.map((s) => {
			const parentOverrides = handWrittenParentOverrides(s.name);
			const desc = escapeForSingleQuote(
				parentOverrides.describe ?? s.description.split("\n")[0] ?? ""
			);
			const hideCommand = s.hideCommand && !parentOverrides.expose;
			return `  { command: lazyCommand<CommonYargsOptions>('${s.name}', '${desc}', () => import('./${s.name}/index.js'), null), hideCommand: ${hideCommand} }`;
		})
		.join(",\n");

	const indexCode = `/**
 * Generated CLI commands
 * @generated
 */
import { lazyCommand } from '#lib/lazy-command.js';
import type { CommandModule } from 'yargs';
import type { CommonYargsOptions } from '#lib/cli-types.js';

export interface GeneratedCommand {
  command: CommandModule<CommonYargsOptions>;
  hideCommand: boolean;
}

export const generatedCommands: GeneratedCommand[] = [
${entries}
];
`;

	forge.emit("index.ts", indexCode);

	console.log(
		`    ✅ Generated _generated/index.ts with ${allSchemas.length} resources`
	);

	// Build descriptions map for product and method group levels (recursively)
	const descriptions: Record<string, string> = {};
	const collectGroupDescriptions = (
		methods: (Schema.method | Schema.methodGroup)[],
		prefix: string
	) => {
		for (const item of methods) {
			if (isMethodGroup(item)) {
				const key = `${prefix} ${item.name}`;
				descriptions[key] = item.description;
				collectGroupDescriptions(item.methods, key);
			}
		}
	};
	for (const schema of allSchemas) {
		const parentOverrides = handWrittenParentOverrides(schema.name);
		// Product-level description: "dns" → "DNS management API..."
		descriptions[schema.name] = parentOverrides.describe ?? schema.description;
		// Method group descriptions (recursive): "dns records" → "DNS records management"
		collectGroupDescriptions(schema.methods, schema.name);
		// Hand-written sub-groups describe themselves, since there is no spec
		// group to read a description off.
		for (const sg of handWrittenSubGroups(schema.name)) {
			descriptions[`${schema.name} ${sg.name}`] = sg.describe;
		}
	}
	for (const command of rootHandWrittenCommands()) {
		const name = command.command.split(/\s+/)[0];
		descriptions[name] = command.describe === false ? "" : command.describe;
	}

	// Write metadata file
	const metadataContent = generateMetadataFile(allCommandMeta, descriptions);
	forge.emit("_meta/commands.json", metadataContent);
	console.log(
		`    ✅ Generated _meta/commands.json with ${allCommandMeta.length} commands`
	);

	const allCommandMetaByCommand = new Map(
		allCommandMeta.map((meta) => [meta.command, meta])
	);
	const handWrittenCommandMeta: HandWrittenCommandMeta[] = [];
	for (const command of rootHandWrittenCommands()) {
		for (const meta of rootCommandMeta.filter(
			(meta) => meta.fullPath[0] === rootCommandName(command)
		)) {
			handWrittenCommandMeta.push({
				...meta,
				handWritten: {
					kind: "root",
					overrides: false,
					dir: command.dir,
				},
			});
		}
	}
	for (const command of leafHandWrittenCommands()) {
		const meta = allCommandMetaByCommand.get(
			`cf ${command.parent.replaceAll("/", " ")} ${command.name}`
		);
		if (meta === undefined) {
			generationErrors.push(
				`Hand-written leaf command "${command.parent} ${command.name}" did not produce command metadata.`
			);
			continue;
		}
		handWrittenCommandMeta.push({
			...meta,
			handWritten: {
				kind: "leaf",
				overrides: false,
				dir: command.dir,
				parent: command.parent,
			},
		});
	}
	for (const command of subGroupHandWrittenCommands()) {
		const prefix = [command.parent, command.name];
		const metas = allCommandMeta.filter((meta) =>
			prefix.every((segment, index) => meta.fullPath[index] === segment)
		);
		for (const meta of metas) {
			handWrittenCommandMeta.push({
				...meta,
				handWritten: {
					kind: "subgroup",
					overrides: false,
					dir: command.dir,
					parent: command.parent,
				},
			});
		}
	}
	for (const command of leafOverrideHandWrittenCommands()) {
		const path = command.emitKey.split("/");
		const meta = allCommandMetaByCommand.get(`cf ${path.join(" ")}`);
		if (meta === undefined) {
			generationErrors.push(
				`Hand-written leaf override "${command.emitKey}" did not produce command metadata.`
			);
			continue;
		}
		handWrittenCommandMeta.push({
			...meta,
			handWritten: {
				kind: "leafOverride",
				overrides: true,
				dir: command.dir,
				emitKey: command.emitKey,
			},
		});
	}
	handWrittenCommandMeta.sort((a, b) => a.command.localeCompare(b.command));
	const handWrittenDescriptionKeys = new Set<string>();
	for (const meta of handWrittenCommandMeta) {
		for (let i = 1; i < meta.fullPath.length; i++) {
			handWrittenDescriptionKeys.add(meta.fullPath.slice(0, i).join(" "));
		}
	}
	const handWrittenDescriptions = Object.fromEntries(
		Object.entries(descriptions).filter(([key]) =>
			handWrittenDescriptionKeys.has(key)
		)
	);
	const handWrittenMetadataContent = generateMetadataFile(
		handWrittenCommandMeta,
		handWrittenDescriptions
	);
	forge.emit("_meta/hand-written-commands.json", handWrittenMetadataContent);
	console.log(
		`    ✅ Generated _meta/hand-written-commands.json with ${handWrittenCommandMeta.length} commands`
	);

	// Write schema file
	const schemasContent = generateSchemaFile(allSchemaInfo);
	forge.emit("_meta/schemas.json", schemasContent);
	console.log(
		`    ✅ Generated _meta/schemas.json with ${allSchemaInfo.size} schemas`
	);

	// Report all generation errors collected during generate phase
	if (generationErrors.length > 0) {
		console.error(
			`\n❌ ${generationErrors.length} command(s) failed to generate:\n`
		);
		for (const err of generationErrors.sort()) {
			console.error(`  • ${err}`);
		}
		console.error("");
		throw new Error(
			`${generationErrors.length} command(s) failed to generate — cannot generate CLI.`
		);
	}
};
