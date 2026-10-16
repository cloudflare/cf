/**
 * Walks the command tree and emits every file: a module per command, an
 * index per command group, the root index, and the metadata in `_meta/`.
 *
 * A port of cf's `generator/index.ts`, `generator.ts`, `metadata.ts`,
 * `emit/index-files.ts` and `hand-written-overrides.ts`.
 */
import {
	type Arg,
	derive,
	downgradeOptionalParents,
	isBody,
	isWorkerName,
	optionDefaults,
	options as optionArgs,
	positionals,
	scalar,
} from "./args.js";
import { builderLines } from "./emit/builder.js";
import { handler, imports } from "./emit/handler.js";
import { context, escapeSingle, outputKind } from "./emit/index.js";
import { operationLiteral, operationPath, usesPathTag } from "./emit/sdk.js";
import {
	type DryRun,
	type HandWritten,
	type Leaf,
	rootName,
	type SubGroup,
} from "./hand-written.js";
import {
	codeUnitCompare,
	firstWord,
	GenerateError,
	get,
	isObject,
	kebab,
	localeCompare,
	normalizeSpaces,
	type Obj,
	obj,
	quote,
	stringifyPretty,
	trimEndMatches,
	type Value,
} from "./js.js";
import type { Command, Group, Item, Method } from "./commands.js";
import type { OperationInfo, ParameterInfo } from "./operation.js";

/** A generated file. */
export interface Out {
	path: string;
	content: string;
}

/** The resolved operations, by operation ID. */
export type Operations = Map<string, OperationInfo>;

/** Runs `f`, adding an error it reports to `errors`. */
function collect<T>(errors: string[], f: () => T): T | undefined {
	try {
		return f();
	} catch (err) {
		if (err instanceof GenerateError) {
			errors.push(err.message);
			return undefined;
		}
		throw err;
	}
}

function hasLiveContent(group: Group): boolean {
	return hasLiveItems(group.items);
}

/** Reports whether `items` have a method the CLI calls, at any depth. */
function hasLiveItems(items: readonly Item[]): boolean {
	return items.some((item) =>
		item.kind === "group" ? hasLiveContent(item) : !item.deprecated
	);
}

export function summary(method: Method): string {
	const s =
		method.summary === undefined ? undefined : normalizeSpaces(method.summary);
	if (s !== undefined && s !== "") {
		return s;
	}
	const description = method.description.trim();
	const first = (description.split(/[\r\n\u2028\u2029]/)[0] ?? "").trim();
	return first === "" ? description : first;
}

/** `getLeafUsage`: the usage of a leaf command, followed by its full description. */
export function leafUsage(
	method: Method,
	resource: string,
	group: string | undefined,
	command: string
): string {
	const segments =
		group === undefined ? [] : group.split("/").filter((s) => s !== "");
	const path = ["$0", resource, ...segments, command];
	return `${path.join(" ")}\n\n${method.description.trim()}`;
}

/**
 * `getTelemetrySafeFlags`: the flags whose values telemetry may record, with
 * the generated `--force` and `--text` when the command has them.
 */
export function telemetrySafeFlags(
	args: readonly Arg[],
	includeForce: boolean,
	includeText: boolean
): string[] {
	const safe: string[] = [];
	const push = (f: string) => {
		if (!safe.includes(f)) {
			safe.push(f);
		}
	};
	for (const a of args) {
		if (
			!a.positional &&
			!a.secret &&
			(a.type === "boolean" || a.type === "enum")
		) {
			push(kebab(a.name));
		}
	}
	push("dry-run");
	if (includeForce) {
		push("force");
	}
	if (includeText) {
		push("text");
	}
	return safe;
}

function category(name: string): string {
	switch (name) {
		case "list":
		case "info":
		case "get":
		case "export":
		case "status":
		case "insights":
		case "report":
		case "bytime":
			return "read";
		case "create":
			return "create";
		case "update":
		case "edit":
		case "patch":
			return "update";
		case "delete":
		case "remove":
			return "delete";
		default:
			return "action";
	}
}

/** The relative path from the module at `path` to the generated root. */
function rootPrefix(path: string): string {
	const depth = path.split("/").length - 1;
	return depth === 0 ? "./" : "../".repeat(depth);
}

/** The first line of `s`. */
function firstLine(s: string): string {
	return s.split("\n")[0] ?? "";
}

const commandOf = (m: Value): string => {
	const c = get(m, "command");
	return c === undefined ? "" : String(c);
};

const fullPathOf = (m: Value): string[] => {
	const p = get(m, "fullPath");
	return Array.isArray(p) ? (p as readonly Value[]).map(String) : [];
};

/**
 * What a walk emits: the files of commands, or their metadata. Each top-level
 * command's files depend on that command alone, so they are emitted for each
 * group in parallel, and the metadata, which lists every command, once.
 */
type Mode = "files" | "metadata";

class Walk {
	readonly files: Out[] = [];
	readonly metas: Value[] = [];
	/** By command, in the order they are first set. */
	readonly schemas = new Map<string, Value>();
	readonly errors: string[] = [];

	constructor(
		readonly ops: Operations,
		readonly hand: HandWritten,
		readonly mode: Mode
	) {}

	operation(method: Method): OperationInfo | undefined {
		return this.ops.get(method.operationId);
	}

	resolve(method: Method): OperationInfo {
		const r = this.operation(method);
		if (!r) {
			throw new GenerateError(`Operation ID missing for ${method.name}`);
		}
		return r;
	}

	/** `generateCommandMeta`. */
	commandMeta(
		method: Method,
		resource: string,
		group: string | undefined,
		hide: boolean
	): Obj {
		const op = this.operation(method);
		if (!op) {
			throw new GenerateError(
				`Failed to resolve operation for method: ${method.operationId}`
			);
		}
		const derived = derive(method, resource, op);
		downgradeOptionalParents(derived);
		const positional = positionals(derived);
		const options = optionArgs(derived);
		const defaults = optionDefaults(derived, op);
		if (resource === "workers") {
			for (const p of op.pathParams) {
				if (!isWorkerName(p.name.replaceAll("_", "-"))) {
					continue;
				}
				if (options.some((a) => a.name === "worker")) {
					continue;
				}
				options.push({
					name: "worker",
					description: p.description ?? `The ${p.name.replaceAll("_", " ")}`,
					type: "string",
					choices: undefined,
					default: undefined,
					required: true,
					positional: false,
					origin: { in: "path", name: p.name },
					conflicts: undefined,
					implies: undefined,
					secret: false,
					fromFile: undefined,
					isZone: false,
					isWorkerName: true,
				});
			}
		}
		const fullPath = [resource];
		if (group !== undefined) {
			fullPath.push(...group.split("/"));
		}
		fullPath.push(method.name);
		const command = `cf ${fullPath.join(" ")}`;
		const positionalUsage = positional
			.map((a) => {
				const name = a.type === "array" ? `${a.name}...` : a.name;
				return a.required ? `<${name}>` : `[${name}]`;
			})
			.join(" ");
		const suffix = options.length === 0 ? "" : " [options]";
		const usage =
			positionalUsage === ""
				? `${command}${suffix}`
				: `${command} ${positionalUsage}${suffix}`;
		const args: Value[] = positional.map((a, i) => {
			const m = obj();
			m["name"] = a.name;
			m["position"] = i;
			m["type"] = scalar(a.type);
			m["required"] = a.required;
			m["description"] = a.description;
			if (a.choices !== undefined && a.choices.length > 0) {
				m["enum"] = a.choices;
			}
			return m;
		});
		const optionMetas: Value[] = options.map((a) => {
			const m = obj();
			m["name"] = a.name;
			m["type"] = scalar(a.type);
			m["required"] = a.required;
			m["description"] = a.description;
			const dflt = defaults.get(a.name);
			if (dflt !== undefined) {
				m["default"] = dflt;
			}
			if (a.choices !== undefined && a.choices.length > 0) {
				m["enum"] = a.choices;
			}
			return m;
		});
		optionMetas.push(
			obj([
				["name", "dry-run"],
				["type", "boolean"],
				["required", false],
				[
					"description",
					"Validate and show what would happen without executing",
				],
				["default", false],
			])
		);
		if (derived.hasBody) {
			optionMetas.push(
				obj([
					["name", "body"],
					["type", "string"],
					["required", false],
					["description", "Raw JSON request body (bypasses individual flags)"],
				])
			);
		}
		if (derived.hasFileUpload) {
			optionMetas.push(
				obj([
					["name", "file"],
					["type", "string"],
					["required", false],
					["description", "Path to a file to upload as the request body"],
				])
			);
		}
		return obj([
			["command", command],
			["name", method.name],
			["fullPath", fullPath],
			["description", method.description],
			["summary", summary(method)],
			["usage", usage],
			["arguments", args],
			["options", optionMetas],
			["category", category(method.name)],
			["hasRequestBody", op.hasRequestBody],
			["httpMethod", op.method.toUpperCase()],
			["apiPath", op.path],
			["operationId", method.operationId],
			["hideCommand", hide],
		]);
	}

	/** `generateSchemaInfo`. */
	schemaInfo(method: Method, resource: string): Value | undefined {
		const op = this.operation(method);
		if (!op) {
			return undefined;
		}
		const derived = derive(method, resource, op);
		downgradeOptionalParents(derived);
		const params = (list: readonly ParameterInfo[]): Value[] =>
			list.map((p) =>
				obj([
					["name", p.name],
					["type", p.type],
					["required", p.required],
				])
			);
		const fields: Value[] = derived.args.filter(isBody).map((a) =>
			obj([
				["name", a.name],
				["type", scalar(a.type)],
				["required", a.required],
				["description", a.description],
			])
		);
		return obj([
			["operationId", method.operationId],
			["httpMethod", op.method.toUpperCase()],
			["path", op.path],
			["pathParams", params(op.pathParams)],
			["queryParams", params(op.queryParams)],
			["hasRequestBody", op.hasRequestBody],
			["requestBodyFields", fields],
		]);
	}

	/** `generateCommandFile`. */
	commandFile(
		method: Method,
		resource: string,
		group: string | undefined,
		emitPath: string
	): string {
		const op = this.resolve(method);
		const [ctx, command] = context(
			method,
			resource,
			group,
			op,
			rootPrefix(emitPath)
		);
		const handlerLines = handler(ctx);
		const importSet = imports(ctx);
		const builder = builderLines(ctx);
		const usage = leafUsage(method, resource, group, command);
		const builderBody = `return yargs\n      .usage(${quote(usage)})\n${builder.join("\n")};`;
		const declarations = "type Args = InferArgs<typeof builder>;\n";
		const telemetryPath =
			group !== undefined && group !== ""
				? `${resource} ${group.replaceAll("/", " ")} ${method.name}`
				: `${resource} ${method.name}`;
		const hasForce = ctx.derived.args.some((a) => a.name === "force");
		const generatedForce =
			(op.method === "delete" ||
				(method.requireConfirmation !== undefined &&
					method.requireConfirmation !== "")) &&
			!hasForce;
		const safeFlags = telemetrySafeFlags(
			ctx.derived.args,
			generatedForce,
			ctx.outputKind === "binary"
		);
		const safe = `[${safeFlags.map((f) => `'${escapeSingle(f)}'`).join(", ")}]`;
		const aliases = generatedForce
			? ", shortFlagAliases: { f: { canonical: 'force', type: 'boolean' } }"
			: "";
		return `/**
 * ${method.name} command
 * @generated from apis/overlays/${resource}.ts
 */
${importSet.render().join("\n")}

function builder(yargs: Argv<CommonYargsOptions>) {
  ${builderBody}
}

${declarations}
const command: CommandModule<CommonYargsOptions, Args> = {
  command: '${command}',
  describe: '${escapeSingle(summary(method))}',
  builder,
  handler: async (argv): Promise<void> =>
    runWithTelemetry(
      {
        command: '${escapeSingle(telemetryPath)}',
        classification: { safeFlags: ${safe}${aliases} } satisfies ArgClassification<Args>,
      },
      argv as Record<string, unknown>,
      async () => {
${handlerLines.join("\n")}
      },
    ),
};

export default command;
`;
	}

	/** `emitLeafCommand`. */
	leaf(
		method: Method,
		resource: string,
		group: string | undefined,
		hide: boolean,
		emitPath: string,
		leaves: string[]
	): void {
		const key = trimEndMatches(emitPath, ".ts");
		const dir = this.hand.leafOverrideDir(key);
		const files = this.mode === "files";
		const result = collect(
			this.errors,
			(): [string | undefined, Obj | undefined] => {
				if (dir === undefined) {
					if (files) {
						return [
							this.commandFile(method, resource, group, emitPath),
							undefined,
						];
					}
					// What writing the file checks, so that the metadata pass
					// reports what the files would.
					outputKind(this.resolve(method));
					return [undefined, this.commandMeta(method, resource, group, hide)];
				}
				const meta = this.commandMeta(method, resource, group, hide);
				const sidecar = this.hand.leafOverrideMeta(dir);
				for (const [k, v] of Object.entries(sidecar)) {
					meta[k] = v;
				}
				return [undefined, meta];
			}
		);
		if (result === undefined) {
			return;
		}
		const [code, meta] = result;
		if (!files && meta !== undefined) {
			this.metas.push(meta);
		}
		const info = files
			? undefined
			: collect(this.errors, () => this.schemaInfo(method, resource));
		if (info !== undefined) {
			const path =
				group === undefined
					? `${resource} ${method.name}`
					: `${resource} ${group.replaceAll("/", " ")} ${method.name}`;
			this.schemas.set(path, info);
		}
		if (code !== undefined) {
			this.files.push({ path: emitPath, content: code });
		}
		leaves.push(method.name);
	}

	/** `processMethodGroup`: the names of the group's leaves and subgroups. */
	group(
		group: Group,
		prefix: string,
		resource: string,
		groupPath: string,
		hide: boolean
	): [string[], string[]] {
		const leaves: string[] = [];
		const subgroups: string[] = [];
		const leafNames = group.items
			.filter((i): i is Method => i.kind === "method" && !i.deprecated)
			.map((m) => m.name);
		for (const item of group.items) {
			if (item.kind === "method") {
				if (item.deprecated) {
					continue;
				}
				this.leaf(
					item,
					resource,
					groupPath,
					hide,
					`${prefix}${item.name}.ts`,
					leaves
				);
				continue;
			}
			if (leafNames.includes(item.name) || !hasLiveContent(item)) {
				continue;
			}
			const childPrefix = `${prefix}${item.name}/`;
			const [commands, subs] = this.group(
				item,
				childPrefix,
				resource,
				`${groupPath}/${item.name}`,
				hide
			);
			const index = collect(this.errors, () =>
				this.groupIndex(item, resource, commands, subs, childPrefix)
			);
			if (index !== undefined && this.mode === "files") {
				this.files.push({ path: `${childPrefix}index.ts`, content: index });
			}
			subgroups.push(item.name);
		}
		const parent = trimEndMatches(prefix, "/");
		for (const command of this.mode === "metadata"
			? this.hand.leaves(parent)
			: []) {
			const meta = collect(this.errors, () =>
				this.hand.leafMeta(command.parent, command)
			);
			if (meta !== undefined) {
				this.metas.push(meta);
			}
		}
		leaves.sort(codeUnitCompare);
		subgroups.sort(localeCompare);
		return [leaves, subgroups];
	}

	indexFile(
		command: string,
		describe: string,
		resource: string,
		header: string,
		commands: readonly string[],
		prefix: string,
		subgroups: readonly [string, SubGroup | undefined][]
	): string {
		const importLines: string[] = [];
		const registrations: string[] = [];
		// A hand-written command handles `--dry-run` by the strategy it
		// chose, which the index wraps it with.
		let wraps = false;
		const register = (v: string, dryRun: DryRun | undefined) => {
			if (dryRun === undefined) {
				registrations.push(`    .command(${v})`);
				return;
			}
			wraps = true;
			registrations.push(
				`    .command(withHandWrittenDryRun(${v}, '${String(dryRun)}'))`
			);
		};
		const parent = trimEndMatches(prefix, "/");
		for (const cmd of commands) {
			const v = `$${cmd.replaceAll("-", "")}`;
			const key = `${prefix}${cmd}`;
			const overrideDir = this.hand.leafOverrideDir(key);
			const module =
				this.hand.leafModule(key) ??
				(overrideDir !== undefined
					? `#commands/${overrideDir}/index.js`
					: `./${cmd}.js`);
			importLines.push(`import ${v} from '${module}';`);
			const leaf = this.hand.leaves(parent).find((l) => l.name === cmd);
			register(v, leaf?.dryRun);
		}
		for (const [name, handWritten] of subgroups) {
			const v = `$${name.replaceAll("-", "")}`;
			const module =
				handWritten !== undefined
					? `#commands/${handWritten.dir}/index.js`
					: `./${name}/index.js`;
			importLines.push(`import ${v} from '${module}';`);
			register(v, handWritten?.dryRun);
		}
		const wrapper = wraps
			? "import { withHandWrittenDryRun } from '#lib/hand-written-dry-run.js';"
			: "";
		return `/**
 * ${header}
 * @generated from apis/overlays/${resource}.ts
 */
import type { CommandModule } from 'yargs';
import type { CommonYargsOptions } from '#lib/cli-types.js';
${wrapper}
${importLines.join("\n")}

const command: CommandModule<CommonYargsOptions> = {
  command: '${command}',
  describe: '${escapeSingle(describe)}',

  builder: (yargs) => {
    return yargs
${registrations.join("\n")}
    .demandCommand(1, "Please specify a subcommand");
  },

  handler: () => {},
};

export default command;
`;
	}

	private assertNoCollisions(
		parent: string,
		leaves: readonly Leaf[],
		commands: readonly string[],
		groups: readonly string[]
	): void {
		for (const leaf of leaves) {
			if (commands.includes(leaf.name) || groups.includes(leaf.name)) {
				throw new GenerateError(
					`Hand-written leaf command "${parent} ${leaf.name}" collides with a command or group of the same name in the spec. Remove or update it in src/commands/hand-written.ts.`
				);
			}
		}
	}

	/** `generateGroupIndexFile`. */
	groupIndex(
		group: Group,
		resource: string,
		commands: readonly string[],
		subgroups: readonly string[],
		prefix: string
	): string {
		const parent = trimEndMatches(prefix, "/");
		const leaves = this.hand.leaves(parent);
		this.hand.assertUniqueLeaves(parent, leaves);
		this.assertNoCollisions(
			parent.replaceAll("/", " "),
			leaves,
			commands,
			subgroups
		);
		const all = [...commands, ...leaves.map((l) => l.name)];
		all.sort(codeUnitCompare);
		const subs = subgroups.map((s): [string, SubGroup | undefined] => [
			s,
			undefined,
		]);
		return this.indexFile(
			group.name,
			group.description,
			resource,
			`${group.name} command group`,
			all,
			prefix,
			subs
		);
	}

	/** `generateResourceIndexFile`. */
	resourceIndex(
		command: Command,
		commands: readonly string[],
		groups: readonly string[]
	): string {
		const leaves = this.hand.leaves(command.name);
		this.hand.assertUniqueLeaves(command.name, leaves);
		const handGroups = this.hand.subgroups(command.name);
		for (const leaf of leaves) {
			this.assertNoCollisions(command.name, [leaf], commands, groups);
			if (handGroups.some((g) => g.name === leaf.name)) {
				throw new GenerateError(
					`Hand-written leaf command "${command.name} ${leaf.name}" collides with a hand-written sub-group of the same name.`
				);
			}
		}
		for (const sg of handGroups) {
			if (commands.includes(sg.name) || groups.includes(sg.name)) {
				throw new GenerateError(
					`Hand-written sub-group "${command.name} ${sg.name}" collides with a command or group of the same name in the spec. Remove or update it in src/commands/hand-written.ts.`
				);
			}
		}
		const direct = [...commands, ...leaves.map((l) => l.name)];
		direct.sort(localeCompare);
		const subs: [string, SubGroup | undefined][] = [
			...groups.map((g): [string, SubGroup | undefined] => [g, undefined]),
			...handGroups.map((g): [string, SubGroup | undefined] => [g.name, g]),
		];
		subs.sort((a, b) => localeCompare(a[0], b[0]));
		const [describe] = this.hand.parentOverride(command.name);
		return this.indexFile(
			command.name,
			describe ?? firstLine(command.description),
			command.name,
			`${command.name} command`,
			direct,
			`${command.name}/`,
			subs
		);
	}
}

/** Returns `meta` with `handWritten` set. */
function withHandWritten(meta: Value, handWritten: Value): Obj {
	const m = obj(isObject(meta) ? Object.entries(meta) : []);
	m["handWritten"] = handWritten;
	return m;
}

/** Reports whether a command has something to call, generated or hand-written. */
function isLive(command: Command, hand: HandWritten): boolean {
	const under = (parent: string) =>
		parent === command.name || parent.startsWith(`${command.name}/`);
	return (
		hasLiveItems(command.items) ||
		hand.leavesUnder(under) ||
		hand.subgroupsUnder(under)
	);
}

/**
 * Walks `command`: its leaves and groups, and its resource index, which the
 * files of its groups and leaves are imported from, and which is written
 * with `index`. Either mode checks everything the other does, so the
 * metadata pass reports every error the files would.
 */
function walkCommand(w: Walk, command: Command, index: boolean): void {
	const hand = w.hand;
	const [, expose] = hand.parentOverride(command.name);
	const hide = command.hideCommand && !expose;
	const direct: string[] = [];
	const groups: string[] = [];
	const directNames = command.items
		.filter((i): i is Method => i.kind === "method" && !i.deprecated)
		.map((m) => m.name);
	for (const item of command.items) {
		if (item.kind === "method") {
			if (item.deprecated) {
				continue;
			}
			w.leaf(
				item,
				command.name,
				undefined,
				hide,
				`${command.name}/${item.name}.ts`,
				direct
			);
			continue;
		}
		if (directNames.includes(item.name) || !hasLiveContent(item)) {
			continue;
		}
		const prefix = `${command.name}/${item.name}/`;
		const [cmds, subs] = w.group(item, prefix, command.name, item.name, hide);
		const groupIndex = collect(w.errors, () =>
			w.groupIndex(item, command.name, cmds, subs, prefix)
		);
		if (groupIndex !== undefined && w.mode === "files") {
			w.files.push({ path: `${prefix}index.ts`, content: groupIndex });
		}
		groups.push(item.name);
	}
	direct.sort(codeUnitCompare);
	groups.sort(localeCompare);
	const content = w.resourceIndex(command, direct, groups);
	if (index) {
		w.files.push({ path: `${command.name}/index.ts`, content });
	}
	if (w.mode === "metadata") {
		for (const leaf of hand.leaves(command.name)) {
			const meta = collect(w.errors, () => hand.leafMeta(command.name, leaf));
			if (meta !== undefined) {
				w.metas.push(meta);
			}
		}
		for (const sg of hand.subgroups(command.name)) {
			const metas = collect(w.errors, () => hand.subgroupMeta(sg));
			if (metas !== undefined) {
				w.metas.push(...metas);
			}
		}
	}
}

/** Throws the errors `w` collected, if there are any. */
function check(w: Walk): void {
	if (w.errors.length > 0) {
		const errors = [...w.errors].sort(codeUnitCompare);
		throw new GenerateError(
			`${errors.length} command(s) failed to generate — cannot generate CLI.\n${errors.map((e) => `  • ${e}`).join("\n")}`
		);
	}
}

/**
 * Emits the files of the top-level command `command`: a module for each of
 * its leaves, an index for it and each of its groups, and a module for each
 * of its operations. `ops` has its operations. A command with nothing to
 * call has only the operations.
 */
export function commandFiles(
	ops: Operations,
	command: Command,
	hand: HandWritten
): Out[] {
	// `metadataFiles` reports a command that collides with the Access root.
	if (command.name === ACCESS.name) {
		return [];
	}
	const operations = operationFiles(ops);
	if (!isLive(command, hand)) {
		return operations;
	}
	const w = new Walk(ops, hand, "files");
	walkCommand(w, command, true);
	check(w);
	return [...w.files, ...operations];
}

/**
 * The module of each of `ops`, at its path in the group tree, as
 * `_operations/d1/database/query.ts` for `d1.database.query`, whose
 * default export is its `Operation`, which its command, and hand-written
 * ones, send with `Client.send`. It imports only the runtime's `path` tag,
 * when its path has parameters, so any module can import it.
 */
function operationFiles(ops: Operations): Out[] {
	return [...ops].map(([id, op]) => ({
		path: `${operationPath(id)}.ts`,
		content: `/** @generated from ${id} */
${usesPathTag(op.path) ? 'import { path } from "#api";\n\n' : ""}export default ${operationLiteral(op)} as const;
`,
	}));
}

/** The synthetic Access root, which only has hand-written commands. */
const ACCESS: Command = {
	name: "access",
	description: "Access protected applications and services",
	items: [],
	hideCommand: false,
};

/**
 * The roots of the parent overrides that create theirs, which `commands`
 * doesn't have yet: empty, until hand-written leaves are spliced in.
 */
function createdRoots(
	commands: readonly Command[],
	hand: HandWritten
): Command[] {
	return hand
		.createdRoots()
		.filter((p) => !commands.some((c) => c.name === p.parent))
		.map((p) => ({
			name: p.parent,
			description: p.describe,
			items: [],
			hideCommand: !p.expose,
		}));
}

/**
 * Emits the files that list every one of `commands`, whose operations `ops`
 * has: the root index and the metadata in `_meta/`, and the indexes of the
 * roots no group generates, the Access root and created ones.
 */
export function metadataFiles(
	ops: Operations,
	commands: readonly Command[],
	hand: HandWritten
): Out[] {
	const w = new Walk(ops, hand, "metadata");
	if (commands.some((c) => c.name === ACCESS.name)) {
		throw new GenerateError(
			"The synthetic Access root collides with a Forge command."
		);
	}
	const synthetic = [ACCESS, ...createdRoots(commands, hand)];
	const all = commands.filter((c) => isLive(c, hand));
	all.push(...synthetic);
	for (const command of all) {
		walkCommand(w, command, synthetic.includes(command));
	}

	const productNames = all.map((c) => c.name);
	const rootMetas: Value[] = [];
	for (const root of hand.roots) {
		const name = rootName(root);
		if (productNames.includes(name)) {
			w.errors.push(
				`Root hand-written command "${name}" collides with a generated product of the same name.`
			);
			continue;
		}
		const metas = collect(w.errors, () => hand.rootMeta(root));
		if (metas !== undefined) {
			for (const meta of metas) {
				rootMetas.push(meta);
				w.metas.push(meta);
			}
		}
	}
	all.sort((a, b) => localeCompare(a.name, b.name));
	w.metas.sort((a, b) => localeCompare(commandOf(a), commandOf(b)));

	const entries = all.map((s) => {
		const [describe, expose] = hand.parentOverride(s.name);
		const desc = escapeSingle(describe ?? firstLine(s.description));
		const hide = s.hideCommand && !expose;
		return `  { command: lazyCommand<CommonYargsOptions>('${s.name}', '${desc}', () => import('./${s.name}/index.js'), null), hideCommand: ${hide} }`;
	});
	w.files.push({
		path: "index.ts",
		content: `/**
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
${entries.join(",\n")}
];
`,
	});

	const descriptions = obj();
	const collectGroups = (items: readonly Item[], prefix: string) => {
		for (const item of items) {
			if (item.kind === "group" && hasLiveContent(item)) {
				const key = `${prefix} ${item.name}`;
				descriptions[key] = item.description;
				collectGroups(item.items, key);
			}
		}
	};
	for (const s of all) {
		const [describe] = hand.parentOverride(s.name);
		descriptions[s.name] = describe ?? s.description;
		collectGroups(s.items, s.name);
		for (const sg of hand.subgroups(s.name)) {
			descriptions[`${s.name} ${sg.name}`] = sg.describe;
		}
	}
	for (const root of hand.roots) {
		descriptions[firstWord(root.command) ?? ""] =
			root.describe === false ? "" : root.describe;
	}
	w.files.push({
		path: "_meta/commands.json",
		content: metadataFile(w.metas, descriptions),
	});

	const handMetas: Value[] = [];
	for (const root of hand.roots) {
		for (const meta of rootMetas) {
			if (fullPathOf(meta)[0] === rootName(root)) {
				handMetas.push(
					withHandWritten(
						meta,
						obj([
							["kind", "root"],
							["overrides", false],
							["dir", root.dir],
						])
					)
				);
			}
		}
	}
	const find = (command: string) => {
		for (let i = w.metas.length - 1; i >= 0; i--) {
			const m = w.metas[i] as Value;
			if (commandOf(m) === command) {
				return m;
			}
		}
		return undefined;
	};
	for (const leaf of hand.allLeaves) {
		const key = `cf ${leaf.parent.replaceAll("/", " ")} ${leaf.name}`;
		const meta = find(key);
		if (meta === undefined) {
			w.errors.push(
				`Hand-written leaf command "${leaf.parent} ${leaf.name}" did not produce command metadata.`
			);
		} else {
			handMetas.push(
				withHandWritten(
					meta,
					obj([
						["kind", "leaf"],
						["overrides", false],
						["dir", leaf.dir],
						["parent", leaf.parent],
					])
				)
			);
		}
	}
	for (const sg of hand.allSubgroups) {
		for (const meta of w.metas) {
			const p = fullPathOf(meta);
			if (p[0] === sg.parent && p[1] === sg.name) {
				handMetas.push(
					withHandWritten(
						meta,
						obj([
							["kind", "subgroup"],
							["overrides", false],
							["dir", sg.dir],
							["parent", sg.parent],
						])
					)
				);
			}
		}
	}
	for (const o of hand.leafOverrides) {
		const key = `cf ${o.emitKey.split("/").join(" ")}`;
		const meta = find(key);
		if (meta === undefined) {
			w.errors.push(
				`Hand-written leaf override "${o.emitKey}" did not produce command metadata.`
			);
		} else {
			handMetas.push(
				withHandWritten(
					meta,
					obj([
						["kind", "leafOverride"],
						["overrides", true],
						["dir", o.dir],
						["emitKey", o.emitKey],
					])
				)
			);
		}
	}
	handMetas.sort((a, b) => localeCompare(commandOf(a), commandOf(b)));
	// Every hand-written command handles `--dry-run`: the registry's types
	// make it choose how, and its metadata must declare the flag.
	for (const meta of handMetas) {
		const options = get(meta, "options");
		const dryRuns = Array.isArray(options)
			? (options as readonly Value[]).filter(
					(option) => get(option, "name") === "dry-run"
				)
			: [];
		if (dryRuns.length !== 1 || get(dryRuns[0], "type") !== "boolean") {
			const dir = String(get(get(meta, "handWritten"), "dir"));
			w.errors.push(
				`${commandOf(meta)} (${dir}/meta.ts) must declare exactly one boolean --dry-run option.`
			);
		}
	}
	const keys: string[] = [];
	for (const meta of handMetas) {
		const p = fullPathOf(meta);
		for (let i = 1; i < p.length; i++) {
			const k = p.slice(0, i).join(" ");
			if (!keys.includes(k)) {
				keys.push(k);
			}
		}
	}
	const handDescriptions = obj(
		Object.entries(descriptions).filter(([k]) => keys.includes(k))
	);
	w.files.push({
		path: "_meta/hand-written-commands.json",
		content: metadataFile(handMetas, handDescriptions),
	});

	const schemas = [...w.schemas.entries()];
	schemas.sort(([a], [b]) => localeCompare(a, b));
	const schemaFile = obj([
		["version", "1.0"],
		["generatedAt", "build-time"],
		["schemas", obj(schemas)],
	]);
	w.files.push({
		path: "_meta/schemas.json",
		content: stringifyPretty(schemaFile, 2),
	});

	check(w);
	return w.files;
}

function metadataFile(commands: readonly Value[], descriptions: Obj): string {
	const m = obj([
		["version", "1.0"],
		["generatedAt", "build-time"],
		["commands", commands],
	]);
	if (Object.keys(descriptions).length > 0) {
		m["descriptions"] = descriptions;
	}
	return stringifyPretty(m, 2);
}
