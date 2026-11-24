import {
	buildApplication,
	buildCommand,
	buildRouteMap,
	proposeCompletions,
	run,
	text_en,
	UnexpectedFlagError,
	UnsatisfiedFlagError,
	UnsatisfiedPositionalError,
} from "@stricli/core";
import cliui from "cliui";
import stringWidth from "string-width";
import { BUILTIN_OPTIONS, GLOBAL_OPTIONS } from "./global-options.js";
import { savedProfiles } from "./profile-completions.js";
import { theme } from "./ui/theme.js";
import type { ApiContext, NativeLeaf } from "./api-command.js";
import type { CommonYargsOptions } from "./cli-types.js";
import type { CommandResolutionFailure } from "./telemetry/types.js";
import type {
	Command,
	CommandContext,
	RouteMap,
	TypedCommandParameters,
} from "@stricli/core";
import type { ArgumentsCamelCase, Argv, CommandModule, Options } from "yargs";

type Args = ArgumentsCamelCase<CommonYargsOptions>;
type Module = CommandModule<CommonYargsOptions> & Partial<NativeLeaf>;
type Hook = (argv: Args) => unknown;
const list = <T>(value: T | readonly T[] | undefined): readonly T[] =>
	value === undefined ? [] : Array.isArray(value) ? value : [value as T];
const camel = (key: string) =>
	key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
const words = (mod: Module) => list(mod.command)[0]?.split(" ") ?? [];
const negativeNumber = /^-(?:\d|\.\d)/;
function parseLiteral(literal: string, opt: Options) {
	if (literal === "!") {
		return opt.type === "number" ? 0 : false;
	}
	if (opt.type === "number") {
		return literal === "" ? undefined : Number(literal.slice(1));
	}
	return literal.slice(1);
}

class Definition {
	flags = new Map<string, Options>(Object.entries(GLOBAL_OPTIONS));
	positions = new Map<string, Options>();
	nativeLeaf?: NativeLeaf;
	registerNative(leaf: NativeLeaf) {
		this.nativeLeaf = leaf;
		leaf.configure(this);
		if (leaf.beforeStartup) {
			this.before.push(leaf.beforeStartup);
		}
	}
	children: Module[] = [];
	routeMap?: () => RouteMap<ApiContext>;
	resolveRoute?: (token: string) => Module | undefined;
	registerRoutes(
		children: Module[],
		resolve: (token: string) => Module | undefined,
		routeMap: () => RouteMap<ApiContext>
	) {
		this.children = children;
		this.resolveRoute = resolve;
		this.routeMap = routeMap;
		this.requireChild = true;
	}
	checks: Hook[] = [];
	before: Hook[] = [];
	after: Hook[] = [];
	config: Record<string, boolean> = {};
	requireChild = false;
	dynamic = false;
	autoHelp = true;
	heading = "";
	footer = "";
	examples: [string, string][] = [];
	groupedOptions = new Set<string>();
	constructor(readonly showHelp: () => void) {}
	command(child: Module) {
		this.children.push(child);
		return this;
	}
	option(name: string, option: Options) {
		const previous = this.flags.get(name);
		this.flags.set(
			name,
			previous?.choices && option.choices
				? { ...option, choices: [...previous.choices, ...option.choices] }
				: option
		);
		return this;
	}
	options(options: Record<string, Options>) {
		for (const [name, option] of Object.entries(options)) {
			this.option(name, option);
		}
		return this;
	}
	positional(name: string, option: Options) {
		this.positions.set(name, option);
		return this;
	}
	usage(text: string) {
		this.heading = text;
		return this;
	}
	epilogue(text: string) {
		this.footer = text;
		return this;
	}
	example(input: string, description: string) {
		this.examples.push([input, description]);
		return this;
	}
	hide(name: string) {
		this.flags.set(name, { ...this.flags.get(name), hidden: true });
		return this;
	}
	group(names: string | string[]) {
		for (const name of list(names)) {
			this.groupedOptions.add(name);
		}
		return this;
	}
	demandCommand() {
		this.requireChild = true;
		return this;
	}
	strictOptions(enabled: boolean) {
		this.dynamic = !enabled;
		return this;
	}
	help(enabled: boolean) {
		this.autoHelp = enabled;
		return this;
	}
	parserConfiguration(config: Record<string, boolean>) {
		Object.assign(this.config, config);
		return this;
	}
	middleware(hook: Hook, early = false) {
		(early ? this.before : this.after).push(hook);
		return this;
	}
	check(hook: Hook) {
		this.checks.push(hook);
		return this;
	}
	coerce(name: string, coerce: Options["coerce"]) {
		const source = this.flags.has(name) ? this.flags : this.positions;
		source.set(name, { ...source.get(name), coerce });
		return this;
	}
	conflicts(name: string, others: string | string[]) {
		return this.check((argv) => {
			for (const other of list(others)) {
				if (argv[name] !== undefined && argv[other] !== undefined) {
					throw new Error(
						`Arguments ${name} and ${other} are mutually exclusive`
					);
				}
			}
		});
	}
	implies(name: string, others: string | string[]) {
		return this.check((argv) => {
			for (const other of list(others)) {
				if (argv[name] !== undefined && argv[other] === undefined) {
					throw new Error(`Missing dependent arguments: ${name} -> ${other}`);
				}
			}
		});
	}
}

function aliases(def: Definition) {
	const names = new Map<string, string>();
	for (const [key, option] of def.flags) {
		for (const name of [key, ...list(option.alias)]) {
			names.set(name, key);
			names.set(camel(name), key);
		}
	}
	return names;
}

function renderHelp(
	def: Definition,
	path: string[],
	mod: Module | undefined,
	width: number
) {
	const prefix = [
		"cf",
		...path.slice(0, -1),
		...(mod ? words(mod).slice(0, 1) : []),
	].join(" ");
	const ui = cliui({ width, wrap: Number.isFinite(width) });
	const columnWidth = (labels: string[]) =>
		Math.min(
			Math.floor(width / 2),
			Math.max(0, ...labels.map((label) => stringWidth(label)))
		) + 4;
	const section = (title: string) => ui.div(theme.brand(title));
	const endRow = (extra?: string) =>
		extra
			? ui.div({ text: extra, padding: [0, 0, 0, 2], align: "right" })
			: ui.div();
	const heading =
		def.heading ||
		(mod
			? `${prefix}${words(mod)
					.slice(1)
					.map((word) => ` ${word}`)
					.join("")}${mod.describe ? `\n\n${mod.describe}` : ""}`
			: "cf <command> [options]\n\nThe Cloudflare CLI - manage your Cloudflare resources");
	ui.div({ text: heading.replaceAll("$0", "cf") });
	ui.div();
	const children = def.children
		.filter((child) => child.describe !== false)
		.map((child) => ({
			label: `${prefix} ${words(child).join(" ")}`,
			description: String(child.describe || ""),
			aliases: [...list(child.command).slice(1), ...list(child.aliases)],
		}))
		.sort((left, right) => left.label.localeCompare(right.label));
	if (children.length) {
		section("Commands");
		const column = columnWidth(children.map((child) => child.label));
		for (const child of children) {
			ui.span(
				{ text: child.label, padding: [0, 2, 0, 2], width: column },
				{ text: child.description }
			);
			endRow(
				child.aliases.length
					? `[aliases: ${child.aliases.join(", ")}]`
					: undefined
			);
		}
		ui.div();
	}
	const opts = (
		title: string,
		entries: [string, Options][],
		positional = false
	) => {
		const flags = entries
			.filter(([, opt]) => !opt.hidden)
			.map(([key, opt]) => {
				const names = [key, ...list(opt.alias)];
				const label = positional
					? names.join(", ")
					: names
							.sort(
								(left, right) =>
									Number(left.length > 1) - Number(right.length > 1)
							)
							.map((name) => (name.length === 1 ? `-${name}` : `--${name}`))
							.join(", ");
				const indent = !positional && label.startsWith("--") ? 4 : 0;
				const variadic =
					positional &&
					mod &&
					words(mod).some(
						(word) =>
							word.slice(1, -1).replace(/\.{2,3}$/, "") === key &&
							/\.{2,3}[\]>]$/.test(word)
					);
				const type = opt.array || variadic ? "array" : opt.type;
				const defaultValue = opt.default ?? (variadic ? [] : undefined);
				const extra = [
					type && `[${type}]`,
					opt.demandOption &&
						(!positional ||
							!mod ||
							words(mod).some(
								(word) => word.slice(1, -1).replace(/\.{2,3}$/, "") === key
							)) &&
						"[required]",
					opt.choices &&
						`[choices: ${opt.choices.map((value) => JSON.stringify(value)).join(", ")}]`,
					defaultValue !== undefined &&
						`[default: ${opt.defaultDescription ?? JSON.stringify(defaultValue)}]`,
				]
					.filter(Boolean)
					.join(" ");
				return {
					label,
					indent,
					extra,
					description: String(opt.description ?? opt.describe ?? ""),
				};
			});
		if (!flags.length) {
			return;
		}
		section(title);
		const column = columnWidth(
			flags.map((flag) => " ".repeat(flag.indent) + flag.label)
		);
		for (const flag of flags) {
			ui.span(
				{
					text: flag.label,
					width: column,
					padding: [0, 2, 0, 2 + flag.indent],
				},
				flag.description
			);
			endRow(flag.extra);
		}
		ui.div();
	};
	const local = [...def.flags].filter(
		([key]) =>
			!Object.hasOwn(GLOBAL_OPTIONS, key) &&
			!Object.hasOwn(BUILTIN_OPTIONS, key) &&
			(!def.positions.has(key) || def.groupedOptions.has(key))
	);
	opts(
		"Positionals",
		[...def.positions].map(([key, opt]) => [
			key,
			{ ...opt, ...def.flags.get(key) },
		]),
		true
	);
	if (def.groupedOptions.size) {
		opts("Options", local);
	}
	opts(
		"Global flags",
		[...def.flags]
			.filter(([key]) => Object.hasOwn(GLOBAL_OPTIONS, key))
			.concat(
				Object.entries(BUILTIN_OPTIONS).map(([key, opt]): [string, Options] => [
					key,
					{ type: "boolean", ...opt, ...def.flags.get(key) },
				])
			)
	);
	if (!def.groupedOptions.size) {
		opts("Options", local);
	}
	if (def.examples.length) {
		section("Examples");
		const column = columnWidth(def.examples.map(([example]) => example));
		for (const [example, description] of def.examples) {
			ui.div(
				{
					text: example.replaceAll("$0", "cf"),
					width: column,
					padding: [0, 2, 0, 2],
				},
				{ text: description }
			);
		}
		ui.div();
	}
	if (def.footer) {
		ui.div(`${def.footer.replaceAll("$0", "cf")}\n`);
	}
	return ui.toString().trimEnd();
}

function closest(input: string, children: Module[]) {
	let best = 4,
		suggestion: string | undefined;
	const visible = new Set(
		children
			.filter((child) => child.describe !== false)
			.map((child) => words(child)[0])
	);
	const names = children
		.flatMap((child) => words(child).slice(0, 1))
		.concat(
			children.flatMap((child) => [
				...list(child.command)
					.slice(1)
					.map((name) => name.split(" ", 1).join("")),
				...list(child.aliases),
			])
		);
	for (const name of names.sort((left, right) => right.length - left.length)) {
		if (!name || Math.abs(input.length - name.length) >= best) {
			continue;
		}
		let prev = Array.from({ length: name.length + 1 }, (_, index) => index);
		let previousRow = prev;
		for (let offset = 0; offset < input.length; offset++) {
			const char = input[offset];
			const next = [offset + 1];
			for (let idx = 0; idx < name.length; idx++) {
				next.push(
					char === name[idx]
						? (prev[idx] ?? Infinity)
						: idx > 0 &&
							  offset > 0 &&
							  char === name[idx - 1] &&
							  input[offset - 1] === name[idx]
							? (previousRow[idx - 1] ?? Infinity) + 1
							: Math.min(
									(next[idx] ?? Infinity) + 1,
									(prev[idx + 1] ?? Infinity) + 1,
									(prev[idx] ?? Infinity) + 1
								)
				);
			}
			previousRow = prev;
			prev = next;
		}
		const distance = prev[name.length] ?? Infinity;
		if (distance < best) {
			best = distance;
			suggestion = visible.has(name) ? name : undefined;
		}
	}
	return suggestion;
}

function routeIndex(def: Definition, args: string[]) {
	const names = aliases(def);
	return args.findIndex((token, offset) => {
		if (token.startsWith("-")) {
			return false;
		}
		const previous = args[offset - 1];
		if (!previous?.startsWith("-")) {
			return true;
		}
		const key = names.get(previous.replace(/^--?/, ""));
		return (
			previous.includes("=") ||
			previous.startsWith("--no-") ||
			["-h", "--help"].includes(previous) ||
			(!!key &&
				def.flags.get(key)?.type === "boolean" &&
				!["true", "false"].includes(token))
		);
	});
}
function matchChild(def: Definition, token: string) {
	return def.resolveRoute
		? def.resolveRoute(token)
		: def.children.find((entry) =>
				[
					...list(entry.command).map((name) => name.split(" ")[0]),
					...list(entry.aliases),
				].includes(token)
			);
}
async function descend(parent: Definition, child: Module) {
	const def = new Definition(parent.showHelp);
	for (const [name, opt] of parent.flags) {
		if (opt.global !== false) {
			def.flags.set(name, opt);
		}
	}
	def.before.push(...parent.before);
	def.after.push(...parent.after);
	if (child.native && child.configure) {
		def.registerNative(child as NativeLeaf);
	} else if (typeof child.builder === "function") {
		await child.builder(def as unknown as Argv<CommonYargsOptions>);
	} else if (child.builder) {
		def.options(child.builder);
	}
	return def;
}
async function complete(roots: Module[], input: string[]) {
	let def = new Definition(() => {});
	def.children = roots;
	let selected: Module | undefined;
	const args = input.slice(0, -1);
	let partial = input.at(-1) ?? "";
	while (def.children.length) {
		const index = routeIndex(def, args);
		const token = args[index];
		if (token === undefined) {
			break;
		}
		selected = matchChild(def, token);
		if (!selected) {
			return [];
		}
		args.splice(index, 1);
		def = await descend(def, selected);
	}
	if (args.includes("--")) {
		return [];
	}
	const equals = partial.startsWith("--") ? partial.indexOf("=") : -1;
	if (equals >= 0) {
		args.push(partial.slice(0, equals));
		partial = partial.slice(equals + 1);
	}
	const config = {
		name: "cf",
		scanner: { caseStyle: "original" },
		completion: { includeAliases: true },
	} as const;
	const options = new Map(def.flags);
	if (def.autoHelp) {
		options.set("help", { ...BUILTIN_OPTIONS.help, type: "boolean" });
	}
	options.set("version", { ...BUILTIN_OPTIONS.version, type: "boolean" });
	const native = def.nativeLeaf?.native();
	const flags: NonNullable<Command<ApiContext>["parameters"]["flags"]> =
		Object.create(null);
	const short: Record<string, string> = Object.create(null);
	for (const [name, opt] of options) {
		if (opt.hidden) {
			continue;
		}
		const brief = opt.description ?? opt.describe ?? "";
		const param = opt.choices
			? {
					kind: "enum" as const,
					brief,
					values: opt.choices.map(String),
					optional: true as const,
				}
			: (native?.parameters.flags?.[name] ??
				(opt.type === "boolean"
					? { kind: "boolean" as const, brief }
					: {
							kind: "parsed" as const,
							brief,
							parse: String,
							optional: true as const,
						}));
		flags[name] =
			name === "profile" &&
			param.kind === "parsed" &&
			def.nativeLeaf?.profileCompletion !== false
				? { ...param, proposeCompletions: savedProfiles }
				: param;
		for (const alias of list(opt.alias)) {
			if (alias.length === 1) {
				short[alias] = name;
			} else {
				flags[alias] = param;
			}
		}
	}
	const leaf = buildCommand<Record<string, unknown>, unknown[]>({
		docs: { brief: native?.brief ?? "" },
		func() {},
		parameters: {
			flags,
			aliases: short,
			positional: native?.parameters.positional ?? {
				kind: "tuple",
				parameters: [...def.positions.values()].map((opt) => ({
					brief: opt.description ?? "",
					parse: String,
					proposeCompletions: () => opt.choices?.map(String) ?? [],
				})),
			},
		} as TypedCommandParameters<
			Record<string, unknown>,
			unknown[],
			CommandContext
		>,
	});
	const suggestions = await proposeCompletions(
		buildApplication(leaf, config, {}),
		[...args, partial],
		{ process }
	);
	const result = suggestions.filter(
		(item) => item.kind !== "argument:flag" || partial.startsWith("-")
	);
	const previous = args.at(-1);
	const key = previous && aliases(def).get(previous.replace(/^--?/, ""));
	if (
		def.children.length &&
		!partial.startsWith("-") &&
		!(previous?.startsWith("-") && key && options.get(key)?.type !== "boolean")
	) {
		if (def.routeMap) {
			return [
				...result,
				...(await proposeCompletions(
					buildApplication(def.routeMap(), config, {}),
					[partial],
					{ process, prepare: async () => ({}) }
				)),
			];
		}
		const routes: Record<string, Command<CommandContext>> = Object.create(null);
		const routeAliases: Record<string, string> = Object.create(null);
		for (const child of def.children) {
			const name = words(child)[0];
			if (!name || child.describe === false) {
				continue;
			}
			routes[name] = buildCommand({
				parameters: {},
				docs: { brief: child.describe ?? "" },
				func() {},
			});
			for (const alias of [
				...list(child.command)
					.slice(1)
					.map((value) => value.split(" ", 1).join("")),
				...list(child.aliases),
			]) {
				if (alias !== name) {
					routeAliases[alias] = name;
				}
			}
		}
		if (Object.keys(routes).length) {
			result.push(
				...(await proposeCompletions(
					buildApplication(
						buildRouteMap({
							routes,
							aliases: routeAliases,
							docs: { brief: "" },
						}),
						config,
						{}
					),
					[partial],
					{ process }
				))
			);
		}
	}
	return result;
}

export function createParser(
	rawArgs: string[],
	roots: Module[],
	hooks: {
		resolve(command: string): void;
		help(text: string, command?: string): string;
		shown(command: string): void;
		fail(
			message: string,
			command?: string,
			resolution?: CommandResolutionFailure
		): never;
		startup(argv: Args, command?: string): Promise<void>;
		helpWidth?: number;
	}
) {
	async function invoke(input: string[], helpOnly: boolean) {
		const path: string[] = [];
		let mod: Module | undefined;
		const command = () => (path.length ? path.join(" ") : undefined);
		const help = () =>
			hooks.help(
				renderHelp(
					def,
					path,
					mod,
					hooks.helpWidth ?? (process.stdout.columns || 80)
				),
				def.autoHelp || helpOnly ? command() : undefined
			);
		const showHelp = () => {
			hooks.shown(command() ?? "cf");
			console.log(help());
		};
		let def = new Definition(showHelp);
		def.footer =
			"For more information, visit https://developers.cloudflare.com/";
		def.children = roots;
		def.requireChild = true;
		const delimiter = input.indexOf("--");
		const args = delimiter < 0 ? [...input] : input.slice(0, delimiter);
		const tail = delimiter < 0 ? [] : input.slice(delimiter + 1);
		const fail = (
			msg: string,
			kind?: CommandResolutionFailure["kind"],
			unknownTokens: string[] = [],
			suggestedCommand?: string
		): never =>
			hooks.fail(
				msg,
				command(),
				kind
					? {
							kind,
							knownCommand: path,
							knownCommandIsLeaf: !!mod && !def.children.length,
							unknownTokens,
							suggestedCommand,
						}
					: undefined
			);
		while (def.children.length) {
			const index = routeIndex(def, args);
			if (index < 0) {
				break;
			}
			const token = args[index];
			if (token === undefined) {
				break;
			}
			const child = matchChild(def, token);
			if (!child) {
				if (!def.requireChild) {
					break;
				}
				const suggestion = closest(token, def.children);
				const unknown = args.slice(index).filter((arg) => !arg.startsWith("-"));
				return fail(
					suggestion
						? `Did you mean ${suggestion}?`
						: `Unknown command${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}`,
					suggestion ? "suggested-command" : "unknown-subcommand",
					unknown,
					suggestion
				);
			}
			mod = child;
			path.push(token);
			args.splice(index, 1);
			hooks.resolve(path.join(" "));
			def = await descend(def, child);
		}
		const wantsHelp =
			helpOnly ||
			(def.autoHelp && args.some((arg) => arg === "--help" || arg === "-h"));
		const spec = mod
			? words(mod)
					.slice(1)
					.map((word) => ({
						key: word.slice(1, -1).replace(/\.{2,3}$/, ""),
						required: word.startsWith("<"),
						many: word.endsWith("..]") || word.endsWith("..>"),
					}))
			: [];
		const names = aliases(def);
		const params: NonNullable<Command<CommandContext>["parameters"]["flags"]> =
			Object.create(null);
		for (const [key, opt] of def.flags) {
			params[key] =
				opt.type === "boolean"
					? {
							kind: "boolean",
							brief: opt.description ?? "",
							optional: true,
							withNegated: def.config["boolean-negation"] !== false,
						}
					: {
							kind: "parsed",
							brief: opt.description ?? "",
							parse: (literal: string) => parseLiteral(literal, opt),
							optional: true,
							variadic: true,
							inferEmpty: !opt.requiresArg && !opt.nargs,
						};
		}
		const parsedTokens: string[] = [],
			nativeTokens: string[] = [],
			positionals: string[] = [],
			unknown: string[] = [];
		const switches = new Map<string, boolean>();
		const seen = new Set<string>();
		let native = def.nativeLeaf;
		const coercions = new Map<Options, unknown[]>();
		const trackCoercion = (opt: Options, value: unknown) => {
			if (opt.coerce) {
				const values = coercions.get(opt) ?? [];
				values.push(value);
				coercions.set(opt, values);
			}
		};
		const checkCoercions = () => {
			for (const [opt, values] of coercions) {
				opt.coerce?.(values.length === 1 ? values[0] : values);
			}
		};
		const addUnknown = (name: string) => {
			for (const alias of def.config["camel-case-expansion"] === false
				? [name]
				: [name, camel(name)]) {
				if (!unknown.includes(alias)) {
					unknown.push(alias);
				}
			}
		};
		for (let idx = 0; idx < args.length; idx++) {
			const arg = args[idx];
			if (arg === undefined) {
				break;
			}
			if (def.autoHelp && (arg === "--help" || arg === "-h")) {
				continue;
			}
			if (!arg.startsWith("-") || arg === "-" || negativeNumber.test(arg)) {
				positionals.push(arg);
				continue;
			}
			if (
				def.config["short-option-groups"] !== false &&
				/^-[a-zA-Z]{2,}$/.test(arg)
			) {
				const shortNames = arg.slice(1).split("");
				if (
					!def.config["unknown-options-as-args"] ||
					shortNames.every((name) => names.has(name))
				) {
					args.splice(idx, 1, ...shortNames.map((name) => `-${name}`));
					idx--;
					continue;
				}
			}
			const [spelling = "", inline] = arg.replace(/^--?/, "").split(/=(.*)/s);
			let key = names.get(spelling);
			const negated =
				!key &&
				inline === undefined &&
				spelling.startsWith("no-") &&
				def.config["boolean-negation"] !== false;
			if (negated) {
				key = names.get(spelling.slice(3));
			}
			if (!key) {
				if (def.config["unknown-options-as-args"]) {
					positionals.push(arg);
					continue;
				}
				if (
					!def.dynamic ||
					!/^--[a-z][\w.-]*$/i.test(arg.split("=")[0] ?? "") ||
					Object.hasOwn(Object.prototype, spelling) ||
					spelling === "prototype"
				) {
					const unknownName = negated ? spelling.slice(3) : spelling;
					addUnknown(
						def.config["dot-notation"] === false
							? unknownName
							: (unknownName.split(".")[0] ?? unknownName)
					);
					if (
						inline === undefined &&
						args[idx + 1] &&
						!args[idx + 1]?.startsWith("-")
					) {
						idx++;
					}
					continue;
				}
				key = spelling;
				const hasValue =
					inline !== undefined ||
					(args[idx + 1] !== undefined && !args[idx + 1]?.startsWith("-"));
				def.flags.set(key, { type: hasValue ? "string" : "boolean" });
				names.set(key, key);
				params[key] = hasValue
					? {
							kind: "parsed",
							brief: "",
							parse: (literal: string) => literal.slice(1),
							optional: true,
							variadic: true,
						}
					: { kind: "boolean", brief: "", optional: true };
			}
			const opt = def.flags.get(key);
			if (!opt) {
				return fail(`Unknown argument: ${spelling}`);
			}
			if (negated && opt.type !== "boolean") {
				native = undefined;
				trackCoercion(opt, false);
				parsedTokens.push(`--${key}`, "!");
				continue;
			}
			const flag = `--${key}`;
			if (opt.type === "boolean") {
				const value =
					inline ??
					(!negated && ["true", "false"].includes(args[idx + 1] ?? "")
						? args[++idx]
						: undefined);
				switches.set(
					flag,
					!negated && (value === undefined || value === "true")
				);
				continue;
			}
			const takesValue = () =>
				idx + 1 < args.length &&
				(!args[idx + 1]?.startsWith("-") ||
					negativeNumber.test(args[idx + 1] ?? "") ||
					args[idx + 1] === "-");
			let value = inline ?? (takesValue() ? args[++idx] : undefined);
			if (!wantsHelp && value === undefined && (opt.requiresArg || opt.nargs)) {
				return fail(`Not enough arguments following: ${key}`);
			}
			const pushValue = (raw: string | undefined) => {
				if (
					(!opt.array && seen.has(key)) ||
					!raw ||
					/[\r\n\u2028\u2029]/.test(raw) ||
					(opt.choices && !opt.coerce && !opt.choices.includes(raw))
				) {
					native = undefined;
				}
				seen.add(key);
				nativeTokens.push(`--${key}=${raw ?? ""}`);
				if (raw !== undefined || !opt.requiresArg) {
					trackCoercion(opt, raw ?? "");
				}
				parsedTokens.push(flag, raw === undefined ? "" : `:${raw}`);
			};
			pushValue(value);
			while (
				(opt.array || opt.type === "array") &&
				!opt.nargs &&
				takesValue()
			) {
				value = args[++idx];
				pushValue(value);
			}
		}
		if (positionals.length > spec.length && !spec.at(-1)?.many) {
			const surplus = positionals.slice(spec.length);
			return fail(
				`Unknown command${surplus.length > 1 ? "s" : ""}: ${surplus.join(", ")}`,
				"surplus-positional",
				surplus
			);
		}
		if (wantsHelp || (def.requireChild && mod)) {
			if (helpOnly) {
				return help();
			}
			showHelp();
			if (wantsHelp || !unknown.length) {
				checkCoercions();
				return;
			}
		}
		if (unknown.length) {
			checkCoercions();
			const required = spec.filter((item) => item.required).length;
			if (positionals.length < required) {
				return fail(
					`Not enough non-option arguments: got ${positionals.length}, need at least ${required}`
				);
			}
			return fail(
				`Unknown argument${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}`,
				mod ? undefined : "missing-command"
			);
		}
		if (!mod) {
			return fail("You need to specify a command", "missing-command");
		}
		const selected = mod;
		const required = spec.filter((item) => item.required).length;
		if (
			positionals.length < required ||
			[...def.flags].some(
				([key, opt]) =>
					opt.demandOption && !seen.has(key) && !switches.has(`--${key}`)
			)
		) {
			native = undefined;
		}
		let result: Record<string, unknown> | undefined;
		let capturedOperands: readonly unknown[] = [];
		const target = native?.native();
		if (
			target &&
			[...switches.keys()].some(
				(key) => !Object.hasOwn(target.parameters.flags ?? {}, key.slice(2))
			)
		) {
			native = undefined;
		}
		const leaf =
			(native && target) ??
			buildCommand<Record<string, unknown>, string[]>({
				parameters: {
					flags: params,
					positional: {
						kind: "array",
						minimum: required,
						parameter: { brief: "Arguments", parse: String },
					},
				} as TypedCommandParameters<
					Record<string, unknown>,
					string[],
					CommandContext
				>,
				docs: { brief: String(mod.describe || "") },
				func(flags, ...values) {
					result = flags;
					capturedOperands = values;
				},
			});
		const app = buildApplication(
			leaf,
			{
				name: "cf",
				scanner: { allowArgumentEscapeSequence: true },
				localization: {
					text: {
						...text_en,
						exceptionWhileRunningCommand(error) {
							throw error;
						},
						exceptionWhileParsingArguments(error) {
							if (error instanceof UnsatisfiedPositionalError) {
								return fail(
									`Not enough non-option arguments: got ${positionals.length}, need at least ${required}`
								);
							}
							if (error instanceof UnexpectedFlagError) {
								const opt = def.flags.get(error.externalFlagName);
								opt?.coerce?.([error.previousInput, error.input]);
								return fail(
									`--${error.externalFlagName} can only be specified once.`
								);
							}
							if (error instanceof UnsatisfiedFlagError) {
								return fail(
									`Missing required argument: ${error.externalFlagName}`
								);
							}
							return fail(
								error instanceof Error ? error.message : "Invalid arguments"
							);
						},
					},
				},
			},
			{}
		);
		let diagnostic = "";
		const stream = {
			write(text: string) {
				diagnostic += text;
			},
		};
		await run(
			app,
			[
				...(native ? nativeTokens : parsedTokens),
				...Array.from(switches, ([flag, value]) => `${flag}=${value}`),
				"--",
				...positionals,
			],
			{
				process: { stdout: stream, stderr: stream },
				prepare,
			} satisfies ApiContext
		);
		if (native && result) {
			return;
		}
		if (!result) {
			return fail(diagnostic.trim() || "Invalid arguments");
		}
		await selected.handler(await prepare(result, capturedOperands));
		async function prepare(
			parsed: Record<string, unknown>,
			operands: readonly unknown[]
		) {
			result = parsed;
			const argv = Object.assign(Object.create(null), {
				$0: "cf",
				_: [...path, ...(def.config["populate--"] ? [] : tail)],
			}) as Args;
			if (def.config["populate--"] && tail.length) {
				argv["--"] = tail;
			}
			const assign = (key: string, raw: unknown, opt: Options) => {
				let value = raw ?? opt.default;
				if (value === undefined) {
					if (opt.demandOption) {
						fail(`Missing required argument: ${key}`);
					}
					return;
				}
				if (
					def.flags.has(key) &&
					Array.isArray(value) &&
					!opt.array &&
					opt.type !== "array" &&
					value.length === 1
				) {
					value = value[0];
				}
				if (opt.coerce) {
					value = opt.coerce(value);
				}
				if (
					opt.choices &&
					!list(value).every((item) =>
						opt.choices?.some((choice) => choice === item)
					)
				) {
					fail(
						`Invalid values:\n  Argument: ${key}, Given: ${JSON.stringify(value)}, Choices: ${opt.choices.map((choice) => JSON.stringify(choice)).join(", ")}`
					);
				}
				for (const name of [key, ...list(opt.alias)]) {
					argv[name] = value;
					if (def.config["camel-case-expansion"] !== false) {
						argv[camel(name)] = value;
					}
				}
			};
			for (const [key, opt] of def.flags) {
				assign(key, parsed[key], opt);
			}
			for (const [idx, item] of spec.entries()) {
				const key = def.positions.has(item.key)
					? item.key
					: ([...def.positions.keys()].find(
							(name) => camel(name) === item.key
						) ?? item.key);
				const opt = def.positions.get(key) ?? {};
				const value = item.many ? operands.slice(idx) : operands[idx];
				if (value !== undefined || opt.default !== undefined) {
					assign(
						key,
						opt.type === "number" && value !== undefined
							? Number(value)
							: value,
						opt
					);
				}
			}
			for (const check of def.checks) {
				const value = await check(argv);
				if (value === false || typeof value === "string") {
					fail(
						typeof value === "string" ? value : "Argument validation failed"
					);
				}
			}
			for (const hook of def.before) {
				await hook(argv);
			}
			await hooks.startup(argv, command());
			for (const hook of def.after) {
				await hook(argv);
			}
			return argv;
		}
	}
	return {
		complete: (input: string[]) => complete(roots, input),
		parse: (args = rawArgs) => invoke(args, false),
		getHelp: async () => String(await invoke(rawArgs, true)),
	};
}
