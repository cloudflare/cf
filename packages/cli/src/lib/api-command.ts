import { buildCommand, buildRouteMap, type RouteMap } from "@stricli/core";
import { GLOBAL_OPTIONS } from "./global-options.js";
import type { CommonYargsOptions } from "./cli-types.js";
import type {
	Command,
	CommandContext,
	TypedCommandParameters,
} from "@stricli/core";
import type { Argv, CommandModule, Options } from "yargs";

type Operand = {
	placeholder: string;
	brief: string;
	parse: StringConstructor | NumberConstructor;
	optional?: boolean;
	rest?: boolean;
	booleanLabel?: boolean;
	proposeCompletions?: (partial: string) => Promise<readonly string[]>;
};
type Flag = {
	brief: string;
	optional?: boolean;
	default?: string | boolean;
	variadic?: boolean;
	alias?: string | readonly string[];
	grouped?: boolean;
	choices?: readonly string[];
	requiresArg?: boolean;
	coerce?: (value: never) => unknown;
} & (
	| { kind: "boolean" }
	| { kind: "enum"; values: readonly string[] }
	| { kind: "parsed"; parse: StringConstructor | NumberConstructor }
);
type ValueOf<Param> = Param extends { kind: "boolean" }
	? boolean
	: Param extends { values: readonly (infer Choice)[] }
		? Choice
		: Param extends { parse: NumberConstructor }
			? number
			: string;
type ParameterValue<Param> = Param extends { variadic: true } | { rest: true }
	? ValueOf<Param>[]
	: ValueOf<Param>;
type ReadValue<Param> = Param extends { optional: true }
	? ParameterValue<Param> | undefined
	: ParameterValue<Param>;
type NamedFlags<Flags> = {
	-readonly [Key in keyof Flags]: ReadValue<Flags[Key]>;
};
type NamedOperands<Operands extends readonly Operand[]> = {
	[Param in Operands[number] as Param["placeholder"]]: ReadValue<Param>;
};
type Camel<Key extends string> = Key extends `${infer Head}-${infer Tail}`
	? `${Head}${Capitalize<Camel<Tail>>}`
	: Key;
type WithAliases<Params> = Params & {
	[Key in keyof Params as Key extends string ? Camel<Key> : never]: Params[Key];
};
type Inputs<Flags, Operands extends readonly Operand[]> = WithAliases<
	{
		[Key in keyof CommonYargsOptions]: CommonYargsOptions[Key];
	} & NamedFlags<Flags> &
		NamedOperands<Operands>
> & {
	accountId?: string;
	zoneId?: string;
	"zone-id"?: string;
	$0: string;
	_: (string | number)[];
};
type Registry = {
	option(name: string, options: Options): unknown;
	positional(name: string, options: Options): unknown;
	usage(text: string): unknown;
	group(name: string): unknown;
};
type Rules = {
	check(fn: (argv: Record<string, unknown>) => unknown): unknown;
	conflicts(name: string, others: string[]): unknown;
	implies(name: string, others: string[]): unknown;
};
export type ApiParameters = {
	flags: Record<string, Flag>;
	operands: readonly Operand[];
	rules?(registry: Rules): void;
};
export type ApiInputs<Params extends ApiParameters> = Inputs<
	Params["flags"],
	Params["operands"]
>;
type Handler<Flags, Operands extends readonly Operand[]> = (
	argv: Inputs<Flags, Operands>
) => void | Promise<void>;
type FlagMap = NonNullable<Command<CommandContext>["parameters"]["flags"]>;
const globalFlags: FlagMap = Object.fromEntries(
	Object.entries(GLOBAL_OPTIONS).map(([key, option]) => [
		key,
		option.type === "boolean"
			? { kind: "boolean", brief: option.description, default: option.default }
			: {
					kind: "parsed",
					brief: option.description,
					parse: String,
					optional: true,
					variadic: true,
				},
	])
);
export interface ApiContext extends CommandContext {
	prepare(
		flags: Record<string, unknown>,
		operands: readonly unknown[]
	): Promise<Record<string, unknown>>;
}
export interface NativeLeaf {
	native(): Command<ApiContext>;
	configure(registry: Registry & Rules): void;
	profileCompletion?: false;
	beforeStartup?: () => void;
}
export function apiCommand<
	const Flags extends Record<string, Flag>,
	const Operands extends readonly Operand[],
>(
	spec: {
		command: string;
		describe: string;
		usage?: string;
		beforeStartup?: () => void;
		profileCompletion?: false;
		flags: Flags;
		operands: Operands;
		rules?(registry: Rules): void;
	} & (
		| { handler: Handler<Flags, Operands> }
		| { loader: () => Promise<{ default: Handler<Flags, Operands> }> }
	)
): NativeLeaf & CommandModule<CommonYargsOptions, Inputs<Flags, Operands>> {
	let target: Command<ApiContext> | undefined;
	const load = async () =>
		"loader" in spec ? (await spec.loader()).default : spec.handler;
	const command: NativeLeaf &
		CommandModule<CommonYargsOptions, Inputs<Flags, Operands>> = {
		...spec,
		configure(registry) {
			if (spec.usage !== undefined) {
				registry.usage(spec.usage);
			}
			for (const param of spec.operands) {
				registry.positional(param.placeholder, {
					type: param.booleanLabel
						? "boolean"
						: param.parse.name === "Number"
							? "number"
							: "string",
					description: param.brief,
					array: param.rest,
					demandOption: !param.optional,
				});
			}
			for (const [name, param] of Object.entries(spec.flags)) {
				const type =
					param.kind === "boolean"
						? "boolean"
						: param.kind === "parsed" && param.parse.name === "Number"
							? "number"
							: "string";
				registry.option(name, {
					type,
					description: param.brief,
					array: param.variadic,
					default:
						type === "number" && param.default !== undefined
							? Number(param.default)
							: param.default,
					choices: param.kind === "enum" ? param.values : param.choices,
					demandOption: !param.optional && param.default === undefined,
					alias:
						typeof param.alias === "string"
							? param.alias
							: param.alias?.slice(),
					requiresArg: param.requiresArg,
					coerce: param.coerce as Options["coerce"],
				});
				if (param.grouped) {
					registry.group(name);
				}
			}
			spec.rules?.(registry);
		},
		native() {
			const handlerOverride =
				this.handler !== command.handler ? this.handler : undefined;
			if (!handlerOverride && target) {
				return target;
			}
			const rest = spec.operands.find((param) => param.rest);
			const positional = rest
				? {
						kind: "array" as const,
						minimum: spec.operands.filter((param) => !param.optional).length,
						parameter: {
							brief: rest.brief,
							parse: String,
							optional: true as const,
						},
					}
				: { kind: "tuple" as const, parameters: spec.operands };
			const aliases = Object.fromEntries(
				Object.entries(spec.flags).flatMap(([key, param]) =>
					typeof param.alias === "string" && param.alias.length === 1
						? [[param.alias, key]]
						: []
				)
			);
			const parameters = {
				flags: { ...globalFlags, ...spec.flags },
				aliases,
				positional,
			} satisfies Command<ApiContext>["parameters"];
			const leaf = buildCommand<NamedFlags<Flags>, unknown[], ApiContext>({
				parameters: parameters as unknown as TypedCommandParameters<
					NamedFlags<Flags>,
					unknown[],
					ApiContext
				>,
				docs: { brief: spec.describe, fullDescription: spec.usage },
				async loader() {
					const handler = handlerOverride ?? (await load());
					return async function (
						this: ApiContext,
						flags: NamedFlags<Flags>,
						...operands: unknown[]
					) {
						const argv = await this.prepare(flags, operands);
						await handler(
							argv as Parameters<typeof command.handler>[0] &
								Inputs<Flags, Operands>
						);
					};
				},
			});
			if (!handlerOverride) {
				target = leaf;
			}
			return leaf;
		},
		async handler(argv) {
			return (await load())(argv as unknown as Inputs<Flags, Operands>);
		},
	};
	return command;
}

type RouteEntry = Pick<CommandModule, "command" | "describe" | "aliases"> &
	Partial<NativeLeaf> & {
		handler(args: never): unknown;
		routeMap?: () => RouteMap<ApiContext>;
	};
type Target = Command<ApiContext> | RouteMap<ApiContext>;
export function apiGroup(spec: {
	command: string;
	describe: string;
	routes: Record<string, RouteEntry>;
}) {
	let map: RouteMap<ApiContext> | undefined;
	const modules = new Map<Target, RouteEntry>();
	const routeMap = () => {
		if (map) {
			return map;
		}
		const routes: Record<string, Target> = Object.create(null);
		const aliases: Record<string, string> = Object.create(null);
		for (const [key, child] of Object.entries(spec.routes)) {
			const target =
				child.routeMap?.() ??
				child.native?.() ??
				buildCommand({
					parameters: {},
					docs: { brief: String(child.describe || "") },
					func() {
						throw new Error(
							"Hand-written routes require the cf command parser"
						);
					},
				});
			routes[key] = target;
			modules.set(target, child);
			for (const alias of [
				...[child.aliases ?? []].flat(),
				...[child.command ?? []]
					.flat()
					.slice(1)
					.map((name) => name.split(" ", 1).join("")),
			]) {
				aliases[alias] = key;
			}
		}
		return (map = buildRouteMap({
			routes,
			aliases,
			docs: { brief: spec.describe },
		}));
	};
	return {
		command: spec.command,
		describe: spec.describe,
		routeMap,
		builder(registry: Argv<CommonYargsOptions>) {
			const group = registry as unknown as {
				registerRoutes(
					children: RouteEntry[],
					resolve: (token: string) => RouteEntry | undefined,
					routeMap: () => RouteMap<ApiContext>
				): void;
			};
			group.registerRoutes(
				Object.values(spec.routes),
				(token) => {
					const target = routeMap().getRoutingTargetForInput(token);
					return target && modules.get(target);
				},
				routeMap
			);
			return registry;
		},
		handler() {},
	} satisfies CommandModule<CommonYargsOptions> & {
		routeMap: () => RouteMap<ApiContext>;
	};
}
