import {
	fileFormat,
	hasChoices,
	isBody,
	multipartFileFlagDescription,
	optionDefaults,
	options as optionArgs,
	positionals,
	WORKER_ALIASES,
} from "../args.js";
import { kebab, obj, stringify, type Value } from "../js.js";
import { type Ctx, escapeSingle } from "./index.js";

const quoted = (v: readonly string[]) => v.map((c) => `'${c}'`).join(", ");

export const JSON_BODY_DESCRIPTION =
	"Raw JSON request body (bypasses individual flags)";

/** Matches the plain-text body classification in `wire()`. */
export const isPlainTextBody = (op: Ctx["op"]) =>
	op.requestContentTypes.length > 0 &&
	op.requestContentTypes.every((type) => type.startsWith("text/plain"));

export function bodyOptionDescription(op: Ctx["op"]): string {
	if (
		op.requestBodyDescription !== undefined &&
		op.requestBodyDescription !== ""
	) {
		return op.requestBodyDescription;
	}
	return isPlainTextBody(op)
		? "Plain-text request body (without JSON quotes)"
		: JSON_BODY_DESCRIPTION;
}

export function parameterSource(ctx: Ctx) {
	const d = ctx.derived;
	const op = ctx.op;
	const positional = positionals(d);
	const options = optionArgs(d);
	const defaults = optionDefaults(d, op);
	const flags = new Map<string, string>();
	const operands: string[] = [];
	const rules: string[] = [];
	function emitFlag(
		name: string,
		type: string,
		description: string,
		extras: Record<string, Value | undefined> = {},
		coerce?: string
	) {
		const { choices, array, required, ...rest } = extras;
		const nativeEnum =
			type === "string" && Array.isArray(choices) && choices.length && !coerce;
		const kind =
			type === "boolean" ? "boolean" : nativeEnum ? "enum" : "parsed";
		const spec = obj([
			["kind", kind],
			["brief", description],
		]);
		if (nativeEnum) spec.values = choices;
		if (array) spec.variadic = true;
		if (!required && rest.default === undefined) spec.optional = true;
		for (const [key, value] of Object.entries(rest))
			if (value !== undefined) spec[key] = value;
		if (!nativeEnum && choices !== undefined) spec.choices = choices;
		if (kind === "parsed" && spec.default !== undefined)
			spec.default = String(spec.default);
		const properties = [stringify(spec).slice(1, -1)];
		if (kind === "parsed")
			properties.push(`parse: ${type === "number" ? "Number" : "String"}`);
		if (coerce) properties.push(`coerce: ${coerce}`);
		flags.set(name, `${stringify(name)}: {${properties.join(", ")}},`);
	}
	for (const arg of positional) {
		const base = escapeSingle(arg.description);
		const desc = arg.isZone ? `${base} (or use --zone flag)` : base;
		operands.push(
			`{placeholder: '${kebab(arg.name)}', brief: '${desc}', parse: ${arg.type === "number" ? "Number" : "String"}, ${arg.required && !arg.isZone && !arg.isWorkerName ? "" : "optional: true,"} ${arg.type === "array" ? "rest: true," : ""}${arg.type === "boolean" ? "booleanLabel: true," : ""}},`
		);
	}
	for (const arg of options) {
		const name = kebab(arg.name);
		const scalarArray = arg.type === "array";
		const json =
			arg.type === "objectArray" ||
			arg.type === "nestedArray" ||
			arg.type === "objectMap";
		const skipDemand = isBody(arg) && d.hasBody;
		const type =
			scalarArray || json
				? "string"
				: arg.type === "number" || arg.type === "boolean"
					? arg.type
					: "string";
		const demand =
			arg.required && !arg.isZone && !arg.isWorkerName && !skipDemand;
		let coerce: string | undefined;
		if (scalarArray && arg.origin.in === "query" && hasChoices(arg)) {
			const commaChoices =
				arg.choices?.filter((value) => value.includes(",")) ?? [];
			const split =
				commaChoices.length > 0
					? `${stringify(commaChoices)}.includes(value) ? [value] : value.split(",")`
					: 'value.split(",")';
			coerce = `(values: string[]) => values.flatMap((value) => ${split})`;
		}
		// Resolve `@file` before cf validates `choices` against the value,
		// so the handler gets the file's contents without reading it twice.
		if (arg.fromFile !== undefined && hasChoices(arg)) {
			coerce = `(value: string) => resolveFileToken(value, ${stringify(name)}, ${fileFormat(arg)})`;
		}
		emitFlag(
			name,
			type,
			arg.description,
			{
				array: scalarArray,
				required: demand,
				choices: arg.choices,
				default: defaults.get(arg.name),
				alias: arg.isWorkerName ? WORKER_ALIASES : undefined,
				grouped: (arg.isWorkerName && arg.positional) || undefined,
			},
			coerce
		);
	}
	emitFlag(
		"dry-run",
		"boolean",
		"Validate and show what would happen without executing",
		{ default: false }
	);
	if (ctx.isDelete) {
		emitFlag(
			"force",
			"boolean",
			"Skip confirmation (useful in scripts and CI)",
			{ alias: "f", default: false }
		);
	}
	if (d.hasBody) {
		emitFlag(
			"body",
			"string",
			bodyOptionDescription(op).replace(/[\r\n\u2028\u2029]/g, " ")
		);
	}
	if (ctx.outputKind === "binary") {
		emitFlag(
			"text",
			"boolean",
			"Decode the response body as UTF-8 text instead of writing raw bytes",
			{ default: false }
		);
	}
	if (d.hasFileUpload) {
		emitFlag("file", "string", "Path to a file to upload as the request body");
	}
	for (const { field, flag } of d.multipartFlagFields) {
		if ([...options, ...positional].some((a) => kebab(a.name) === flag)) {
			continue;
		}
		const type =
			field.type === "number"
				? "number"
				: field.type === "boolean"
					? "boolean"
					: "string";
		emitFlag(flag, type, field.description.replace(/[\r\n\u2028\u2029]/g, " "));
	}
	for (const { field, flag } of d.multipartFileFields) {
		emitFlag(flag, "string", multipartFileFlagDescription(field), {
			array: field.type === "array",
			requiresArg: field.type === "array" || undefined,
		});
	}
	for (const arg of d.args) {
		if (!isBody(arg) || arg.positional) {
			continue;
		}
		const me = kebab(arg.name);
		if (arg.conflicts !== undefined && arg.conflicts.length > 0) {
			rules.push(
				`rules.conflicts('${me}', [${quoted(arg.conflicts.map(kebab))}]);`
			);
		}
		if (arg.implies !== undefined && arg.implies.length > 0) {
			rules.push(
				`rules.implies('${me}', [${quoted(arg.implies.map(kebab))}]);`
			);
		}
	}
	const conflictsByFlag: [string, string[]][] = [];
	for (const a of d.args) {
		if (!isBody(a) || a.positional) {
			continue;
		}
		if (a.conflicts !== undefined && a.conflicts.length > 0) {
			const key = kebab(a.name);
			const value = a.conflicts.map(kebab);
			const entry = conflictsByFlag.find(([k]) => k === key);
			if (entry) {
				entry[1] = value;
			} else {
				conflictsByFlag.push([key, value]);
			}
		}
	}
	for (const group of d.optionalParentGroups) {
		if (
			group.groupSetFlags.length === 0 ||
			(group.requiredFlags.length === 1 &&
				group.groupSetFlags.length === 1 &&
				group.requiredFlags[0] === group.groupSetFlags[0])
		) {
			continue;
		}
		const set = `[${quoted(group.groupSetFlags)}]`;
		const required = `[${quoted(group.requiredFlags)}]`;
		const prefix = `${group.parentName}-`;
		const groupFlags = group.groupSetFlags.every((flag) =>
			flag.startsWith(prefix)
		)
			? `any --${prefix}* flag`
			: `one of ${group.groupSetFlags.map((flag) => `--${flag}`).join(", ")}`;
		const pairs = group.requiredFlags
			.map((f): [string, string[]] => [
				f,
				conflictsByFlag.find(([k]) => k === f)?.[1] ?? [],
			])
			.filter(([, c]) => c.length > 0);
		rules.push("rules.check((argv) => {");
		rules.push(
			`        const groupSet = ${set}.some((k) => argv[k] !== undefined);`
		);
		rules.push("        if (!argv.body && groupSet) {");
		if (pairs.length === 0) {
			rules.push(
				`          const missing = ${required}.filter((k) => argv[k] === undefined);`
			);
		} else {
			const map = pairs.map(([f, c]) => `'${f}': [${quoted(c)}]`).join(", ");
			rules.push(
				`          const requiredConflicts: Record<string, string[]> = { ${map} };`
			);
			rules.push(
				`          const missing = ${required}.filter((k) => argv[k] === undefined && !(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined));`
			);
		}
		rules.push("          if (missing.length > 0) {");
		rules.push(
			`            throw new Error(\`\${missing.map((m) => '--' + m).join(', ')} \${missing.length === 1 ? 'is' : 'are'} required when ${groupFlags} is set\`);`
		);
		rules.push("          }");
		rules.push("        }");
		rules.push("        return true;");
		rules.push("});");
	}
	return [
		`flags: {`,
		...flags.values(),
		`},`,
		`operands: [${operands.join("\n")}],`,
		...(rules.length ? [`rules(rules) {`, ...rules, `},`] : []),
	];
}
