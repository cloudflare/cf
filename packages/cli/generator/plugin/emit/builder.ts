/** Emits a command's yargs builder: a port of cf's `emit/builder.ts`. */
import {
	fileFormat,
	hasChoices,
	isBody,
	options as optionArgs,
	positionals,
} from "../args.js";
import { kebab, obj, stringify, type Value } from "../js.js";
import { type Ctx, escapeSingle } from "./index.js";

function option(name: string, fields: [string, Value | undefined][]): string {
	const map = obj();
	for (const [k, v] of fields) {
		if (v !== undefined) {
			map[k] = v;
		}
	}
	return `.option('${name}', ${stringify(map)})`;
}

const quoted = (v: readonly string[]) => v.map((c) => `'${c}'`).join(", ");

/** `generateBuilderLines`. */
export function builderLines(ctx: Ctx): string[] {
	const d = ctx.derived;
	const op = ctx.op;
	const positional = positionals(d);
	const options = optionArgs(d);
	const conflictFlags: string[] = [];
	for (const a of d.args) {
		if (a.conflicts !== undefined && a.conflicts.length > 0) {
			conflictFlags.push(kebab(a.name));
			conflictFlags.push(...a.conflicts.map(kebab));
		}
	}
	const lines: string[] = [];
	for (const arg of positional) {
		lines.push(`      .positional('${kebab(arg.name)}', {`);
		lines.push(
			`        type: '${arg.type === "number" || arg.type === "boolean" ? arg.type : "string"}',`
		);
		if (arg.type === "array") {
			lines.push("        array: true,");
		}
		const base = escapeSingle(arg.description);
		const desc = arg.isZone ? `${base} (or use --zone flag)` : base;
		lines.push(`        description: '${desc}',`);
		if (arg.required && !arg.isZone && !arg.isWorkerName) {
			lines.push("        demandOption: true,");
		}
		lines.push("      })");
	}
	const partialUpdate = op.method === "patch" || op.method === "put";
	for (const arg of options) {
		const name = kebab(arg.name);
		const scalarArray = arg.type === "array";
		const json = arg.type === "objectArray" || arg.type === "objectMap";
		const skipDemand = isBody(arg) && d.hasBody;
		const disc = op.bodyDiscriminator;
		const discriminator =
			disc !== undefined &&
			arg.origin.in === "body" &&
			arg.origin.path.length === 1 &&
			arg.origin.path[0] === disc.field;
		const suppressDefault =
			scalarArray ||
			json ||
			conflictFlags.includes(name) ||
			(isBody(arg) && partialUpdate && !discriminator);
		const type =
			scalarArray || json
				? "string"
				: arg.type === "number" || arg.type === "boolean"
					? arg.type
					: "string";
		const dflt = suppressDefault ? undefined : arg.default;
		const demand =
			arg.required && !arg.isZone && !arg.isWorkerName && !skipDemand;
		lines.push(
			option(name, [
				["type", type],
				["array", scalarArray ? true : undefined],
				["alias", arg.isWorkerName ? "script-name" : undefined],
				["description", arg.description],
				["choices", arg.choices],
				["default", dflt],
				["demandOption", demand ? true : undefined],
			])
		);
		// Resolve `@file` before yargs validates `choices` against the value,
		// so the handler gets the file's contents without reading it twice.
		if (arg.fromFile !== undefined && hasChoices(arg)) {
			lines.push(
				`.coerce(${stringify(name)}, (value) => resolveFileToken(value, ${stringify(name)}, ${fileFormat(arg)}))`
			);
		}
	}
	lines.push(
		`.option("dry-run", {"type":"boolean","description":"Validate and show what would happen without executing","default":false})`
	);
	const hasForce =
		options.some((o) => o.name === "force") ||
		positional.some((p) => p.name === "force");
	const isDelete =
		op.method === "delete" ||
		(ctx.method.requireConfirmation !== undefined &&
			ctx.method.requireConfirmation !== "");
	if (isDelete && !hasForce) {
		lines.push(
			`.option("force", {"type":"boolean","alias":"f","description":"Skip confirmation (useful in scripts and CI)","default":false})`
		);
	}
	if (d.hasBody) {
		const desc =
			op.requestBodyDescription !== undefined &&
			op.requestBodyDescription !== ""
				? op.requestBodyDescription
				: "Raw JSON request body (bypasses individual flags)";
		lines.push("      .option('body', {");
		lines.push("        type: 'string',");
		lines.push(`        description: '${escapeSingle(desc)}',`);
		lines.push("      })");
	}
	if (ctx.outputKind === "binary") {
		lines.push(
			`.option("text", {"type":"boolean","description":"Decode the response body as UTF-8 text instead of writing raw bytes","default":false})`
		);
	}
	if (op.requestContentTypes.some((c) => c !== "application/json")) {
		lines.push(
			`.option("file", {"type":"string","description":"Path to a file to upload as the request body"})`
		);
	}
	for (const f of d.multipartFlagFields) {
		const k = kebab(f.name);
		if ([...options, ...positional].some((a) => kebab(a.name) === k)) {
			continue;
		}
		const type =
			f.type === "number"
				? "number"
				: f.type === "boolean"
					? "boolean"
					: "string";
		lines.push(`      .option('${k}', {`);
		lines.push(`        type: '${type}',`);
		lines.push(`        description: '${escapeSingle(f.description)}',`);
		lines.push("      })");
	}
	for (const arg of d.args) {
		if (!isBody(arg) || arg.positional) {
			continue;
		}
		const me = kebab(arg.name);
		if (arg.conflicts !== undefined && arg.conflicts.length > 0) {
			lines.push(
				`      .conflicts('${me}', [${quoted(arg.conflicts.map(kebab))}])`
			);
		}
		if (arg.implies !== undefined && arg.implies.length > 0) {
			lines.push(
				`      .implies('${me}', [${quoted(arg.implies.map(kebab))}])`
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
		if (group.groupSetFlags.length === 0) {
			continue;
		}
		const set = `[${quoted(group.groupSetFlags)}]`;
		const required = `[${quoted(group.requiredFlags)}]`;
		const pairs = group.requiredFlags
			.map((f): [string, string[]] => [
				f,
				conflictsByFlag.find(([k]) => k === f)?.[1] ?? [],
			])
			.filter(([, c]) => c.length > 0);
		lines.push("      .check((argv) => {");
		lines.push(
			`        const groupSet = ${set}.some((k) => argv[k] !== undefined);`
		);
		lines.push("        if (groupSet) {");
		if (pairs.length === 0) {
			lines.push(
				`          const missing = ${required}.filter((k) => argv[k] === undefined);`
			);
		} else {
			const map = pairs.map(([f, c]) => `'${f}': [${quoted(c)}]`).join(", ");
			lines.push(
				`          const requiredConflicts: Record<string, string[]> = { ${map} };`
			);
			lines.push(
				`          const missing = ${required}.filter((k) => argv[k] === undefined && !(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined));`
			);
		}
		lines.push("          if (missing.length > 0) {");
		lines.push(
			`            throw new Error(\`\${missing.map((m) => '--' + m).join(', ')} \${missing.length === 1 ? 'is' : 'are'} required when any --${group.parentName}-* flag is set\`);`
		);
		lines.push("          }");
		lines.push("        }");
		lines.push("        return true;");
		lines.push("      })");
	}
	return lines;
}
