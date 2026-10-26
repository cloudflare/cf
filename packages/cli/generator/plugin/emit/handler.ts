/** Emits a command's handler and its imports: a port of cf's `emit/handler/`. */
import {
	ACCOUNT_PATH_PARAMS,
	accountOrZoneLocal,
	type Arg,
	bodyOptions,
	bodyPath,
	fileFormat,
	hasChoices,
	headerArgs,
	isBody,
	isPath,
	pathParamReadKey,
	positionals,
	queryArgs,
	ZONE_PATH_PARAMS,
} from "../args.js";
import {
	codeUnitCompare,
	isIdentifier,
	kebab,
	pushUnique,
	quote,
	setEntry,
	stringify,
} from "../js.js";
import * as sdk from "./sdk.js";
import {
	argLocalIdent,
	argvKey,
	type Ctx,
	emitRawTail,
	escapeSingle,
	escapeTemplate,
	formatOutputCall,
	substitutePath,
	wrapAwait,
} from "./index.js";
import type { OperationInfo } from "../operation.js";

const HEADERS_GUARDED = "Object.keys(headers).length > 0 ? headers : undefined";
const QS_FROM_PARAMS =
	"new URLSearchParams(Object.entries(queryParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()";

function renderOpts(fields: [string, string, boolean][]): string {
	const parts = fields
		.filter(([, , omit]) => !omit)
		.map(([k, v]) => `${k}: ${v}`);
	return `{ ${parts.join(", ")} }`;
}

function requestApi(ctx: Ctx, url: string, opts: string): string {
	const method = quote(ctx.op.method.toUpperCase());
	return opts === ""
		? `requestApi<unknown>(client, ${method}, ${url})`
		: `requestApi<unknown>(client, ${method}, ${url}, ${opts})`;
}

const acceptsJson = (ctx: Ctx) =>
	ctx.op.requestContentTypes.includes("application/json");

/** `emitHandler`. */
export function handler(ctx: Ctx): string[] {
	const lines = prelude(ctx);
	lines.push(...dryRun(ctx));
	lines.push(...auth(ctx));
	if (ctx.isDelete) {
		lines.push(...deleteConfirm(ctx));
	}
	lines.push(...multipart(ctx));
	lines.push(...fileUpload(ctx));
	lines.push(...bodyBypass(ctx));
	lines.push(...bodyPrompts(ctx));
	if (ctx.derived.hasBodyParams) {
		lines.push(...bodyAssembly(ctx));
	} else {
		lines.push(...plainCall(ctx));
	}
	return lines;
}

function prelude(ctx: Ctx): string[] {
	const lines: string[] = [];
	if (ctx.hasParams) {
		lines.push("");
		lines.push("      const queryParams: Record<string, unknown> = {");
		for (const a of queryArgs(ctx.derived)) {
			if (a.origin.in === "query") {
				lines.push(`        '${a.origin.name}': ${argvKey(a.name)},`);
			}
		}
		lines.push("      };");
	}
	if (ctx.hasHeaders) {
		lines.push("");
		lines.push("      const headers: Record<string, string> = {};");
		for (const a of headerArgs(ctx.derived)) {
			if (a.origin.in === "header") {
				const read = argvKey(a.name);
				lines.push(
					`      if (${read} !== undefined) headers['${a.origin.name}'] = String(${read});`
				);
			}
		}
	}
	const fields = ctx.derived.args.filter(isBody);
	// A required body previously supplied through --body still needs explicit
	// input when its only fields become optional JSON map flags.
	if (
		ctx.op.requestBodyMandatory &&
		ctx.derived.hasBodyParams &&
		fields.every((arg) => arg.type === "objectMap" && !arg.required)
	) {
		const missing = [
			"argv.body",
			...(ctx.derived.hasFileUpload ? ["argv.file"] : []),
			...fields.map((a) => argvKey(a.name)),
		]
			.map((read) => `${read} === undefined`)
			.join(" && ");
		const flags = fields.map((arg) => `--${arg.name}`).join(", ");
		lines.push(`      if (${missing}) {`);
		lines.push(
			`        throw new Error(${quote(`--body is required unless at least one JSON map flag is provided (${flags}).`)});`
		);
		lines.push("      }");
	}
	return lines;
}

function parseBodyExpression(ctx: Ctx): string {
	const maps = bodyOptions(ctx.derived)
		.filter((arg) => arg.type === "objectMap" && arg.required)
		.map((arg) => ({ path: bodyPath(arg) ?? [], flag: arg.name }));
	return maps.length > 0
		? `parseBody(argv.body, ${stringify(maps)})`
		: "parseBody(argv.body)";
}

function preservedBodyPaths(ctx: Ctx): string {
	const paths = bodyOptions(ctx.derived)
		.filter((arg) => arg.type === "objectMap")
		.map((arg) => bodyPath(arg) ?? []);
	return paths.length > 0 ? `, ${stringify(paths)}` : "";
}

export function dryRun(ctx: Ctx): string[] {
	const d = ctx.derived;
	const op = ctx.op;
	const positional = positionals(d);
	const sensitive = op.bodyParams
		.filter((p) => p.sensitive)
		.map((p) => [...p.apiFieldPath]);
	const param = (name: string) => {
		const q = quote(name);
		return `\${argv[${q}] == null ? '<${name}>' : encodeURIComponent(String(argv[${q}]))}`;
	};
	const template = substitutePath(op.path, {
		needsWorkerName: ctx.needsWorkerName,
		args: d.args,
		positional,
		firstPositionalIsZone: false,
		accountId: "${__cfDryRunAccountId ?? '<account-id>'}",
		scriptName: "${argv[\"worker\"] ?? '<worker>'}",
		zone: "${argv.zone ?? argv.zoneId ?? '<zone>'}",
		param,
	});
	const pathEntries = ctx.allPathParamNames
		.filter((n) => !ACCOUNT_PATH_PARAMS.includes(n))
		.map((name) => {
			const key = pathParamReadKey(d.args, name);
			const read = argvKey(key);
			const local = accountOrZoneLocal(op.path, name);
			if (local !== undefined) {
				return `${quote(key)}: String(${local})`;
			}
			if (ZONE_PATH_PARAMS.includes(name)) {
				return `${quote(key)}: String(argv.zone ?? ${read} ?? '')`;
			}
			return `${quote(key)}: String(${read} ?? '')`;
		})
		.join(", ");
	const bodyKeys: string[] = [];
	if (d.isMutating) {
		for (const a of positional) {
			if (!isPath(a)) {
				pushUnique(bodyKeys, a.name);
			}
		}
		if (d.hasBodyParams) {
			for (const a of bodyOptions(d)) {
				pushUnique(bodyKeys, a.name);
			}
		}
		if (d.hasBody) {
			pushUnique(bodyKeys, "body");
		}
		if (d.hasFileUpload) {
			pushUnique(bodyKeys, "file");
		}
		for (const f of d.multipartFlagFields) {
			pushUnique(bodyKeys, kebab(f.name));
		}
	}
	const bodyEntries = bodyKeys.map((k) => `${quote(k)}: ${argvKey(k)}`);
	const json = acceptsJson(ctx);
	const multipartOnly =
		d.multipart !== undefined &&
		!op.requestContentTypes.includes("application/octet-stream");
	const flagReads = d.multipartFlagFields.map((f) => argvKey(kebab(f.name)));
	const usesMultipart =
		flagReads.length === 0
			? "false"
			: flagReads.map((r) => `${r} !== undefined`).join(" || ");
	const command = ["cf", ctx.resource];
	if (ctx.group !== undefined && ctx.group !== "") {
		command.push(ctx.group.replaceAll("/", " "));
	}
	command.push(ctx.method.name);
	const commandStr = command.filter((c) => c !== "").join(" ");
	let bodyKind: string;
	if (!d.isMutating) {
		bodyKind = "'none'";
	} else if (multipartOnly) {
		bodyKind = "'multipart'";
	} else if (d.multipart !== undefined && flagReads.length > 0) {
		bodyKind = `${usesMultipart} ? 'multipart' : 'octet-stream'`;
	} else if (d.hasFileUpload && json) {
		bodyKind = "argv.file !== undefined ? 'octet-stream' : 'json'";
	} else if (op.requestContentTypes.length > 0 && !json) {
		bodyKind = "'octet-stream'";
	} else if (bodyEntries.length > 0 || d.hasBody) {
		bodyKind = "'json'";
	} else {
		bodyKind = "'none'";
	}
	const lines = ["      if (argv.dryRun) {"];
	if (ctx.needsAccountId) {
		lines.push(
			ctx.hasAccountOrZoneScope
				? "        const __cfDryRunAccountId = argv.zone === undefined ? await resolveAccountIdSilent() : undefined;"
				: "        const __cfDryRunAccountId = await resolveAccountIdSilent();"
		);
	}
	if (ctx.hasAccountOrZoneScope) {
		lines.push(
			'        const accountOrZone = argv.zone === undefined ? "accounts" : "zones";'
		);
		lines.push(
			'        const accountOrZoneId = argv.zone ?? __cfDryRunAccountId ?? "<account-id>";'
		);
	}
	lines.push("        formatDryRun({");
	lines.push(`          command: '${commandStr}',`);
	lines.push(`          method: '${op.method.toUpperCase()}',`);
	lines.push(
		`          url: \`https://api.cloudflare.com/client/v4${template}\`,`
	);
	lines.push(`          pathParams: { ${pathEntries} },`);
	if (ctx.hasParams) {
		lines.push("          query: queryParams,");
	}
	lines.push(`          bodyKind: ${bodyKind},`);
	if (d.hasBody) {
		if (multipartOnly) {
			lines.push(`          body: { ${bodyEntries.join(", ")} },`);
		} else if (d.multipart !== undefined && flagReads.length > 0) {
			lines.push(`          body: ${usesMultipart}`);
			lines.push(`            ? { ${bodyEntries.join(", ")} }`);
			lines.push("            : argv.body,");
		} else if (json) {
			if (d.hasFileUpload) {
				lines.push("          body: argv.file !== undefined");
				lines.push("            ? { file: argv.file }");
				lines.push("            : argv.body !== undefined");
			} else {
				lines.push("          body: argv.body !== undefined");
			}
			lines.push(`            ? ${parseBodyExpression(ctx)}`);
			if (d.hasBodyParams) {
				lines.push("            : compactBody(");
				const object = bodyObject(ctx, "\t\t\t\t");
				object[object.length - 1] += preservedBodyPaths(ctx);
				for (const line of object) {
					lines.push(`              ${line}`);
				}
				lines.push("            ),");
			} else {
				lines.push("            : undefined,");
			}
		} else {
			lines.push("          body: argv.body,");
		}
	} else if (bodyEntries.length > 0) {
		lines.push(`          body: { ${bodyEntries.join(", ")} },`);
	}
	if (sensitive.length > 0) {
		lines.push(`          sensitiveBodyPaths: ${stringify(sensitive)},`);
	}
	lines.push("        });");
	lines.push("        return;");
	lines.push("      }");
	return lines;
}

function auth(ctx: Ctx): string[] {
	const lines = ["      const client = await createCommandClient(argv);"];
	if (ctx.hasAccountOrZoneScope) {
		lines.push(
			'      const accountOrZone = argv.zone === undefined ? "accounts" : "zones";'
		);
		lines.push('      const accountOrZoneId = accountOrZone === "zones"');
		lines.push(
			"        ? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })"
		);
		lines.push(
			"        : argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();"
		);
		lines.push('      if (accountOrZone === "zones") {');
		lines.push("        argv.zoneId = accountOrZoneId;");
		lines.push("      } else {");
		lines.push("        argv.accountId = accountOrZoneId;");
		lines.push("      }");
	} else if (ctx.needsAccountId) {
		lines.push(
			"      const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();"
		);
		lines.push("      argv.accountId = accountId;");
	}
	if (ctx.needsZoneId && !ctx.hasAccountOrZoneScope) {
		if (ctx.firstPositionalIsZone) {
			const pos = positionals(ctx.derived)[0] as Arg;
			const local = argLocalIdent(pos.name);
			const read = argvKey(pos.name);
			lines.push(
				`      const ${local} = await getZoneId({ zone: argv.zone, zoneId: ${read} }, client, { quiet: argv.quiet });`
			);
			lines.push(`      ${read} = ${local};`);
		} else {
			lines.push(
				"      const zoneId = await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet });"
			);
			lines.push("      argv.zoneId = zoneId;");
		}
	}
	if (ctx.needsWorkerName) {
		const read = ctx.firstPositionalIsWorkerName
			? argvKey(kebab((positionals(ctx.derived)[0] as Arg).name))
			: 'argv["worker"]';
		lines.push(
			`      const scriptName = getWorkerName({ scriptName: ${read} });`
		);
		lines.push(`      ${read} = scriptName;`);
	}
	return lines;
}

function deleteConfirm(ctx: Ctx): string[] {
	const opts =
		ctx.requireConfirmation !== undefined
			? `{ force: Boolean(argv.force), message: \`${escapeTemplate(ctx.requireConfirmation)}\` }`
			: "{ force: Boolean(argv.force) }";
	return [
		"",
		`      if (!(await confirmDelete(${opts}))) {`,
		"        return;",
		"      }",
	];
}

function multipart(ctx: Ctx): string[] {
	const d = ctx.derived;
	const info = d.multipart;
	if (!info) {
		return [];
	}
	const reads = d.multipartFlagFields.map((f) => argvKey(kebab(f.name)));
	const any =
		reads.length === 0
			? "false"
			: reads.map((r) => `${r} !== undefined`).join(" || ");
	const only = !ctx.op.requestContentTypes.includes("application/octet-stream");
	let guard: string;
	if (only) {
		guard =
			reads.length === 0
				? "(argv.file !== undefined) || (argv.body !== undefined)"
				: `(argv.file !== undefined) || (argv.body !== undefined) || ${any}`;
	} else {
		guard = reads.length === 0 ? "false" : any;
	}
	if (guard === "false") {
		return [];
	}
	const payload = info.payloadField ?? "file";
	const lines = [
		"",
		`      if (${guard}) {`,
		"        const formData = new FormData();",
		"        if (argv.file) {",
		"          const fileContent = readFileForFlag(argv.file);",
		`          formData.append('${payload}', new Blob([fileContent]), argv.file.split(/[\\\\/]/).filter(Boolean).pop());`,
		"        } else if (argv.body !== undefined) {",
		`          formData.append('${payload}', argv.body);`,
		"        }",
	];
	for (const f of d.multipartFlagFields) {
		const flag = kebab(f.name);
		const read = argvKey(flag);
		switch (f.type) {
			case "object":
			case "array":
				lines.push(`        if (${read} !== undefined) {`);
				lines.push(
					`          const v = typeof ${read} === 'string' ? resolveFileToken(${read}, '${flag}', 'text') : ${read};`
				);
				lines.push(
					`          formData.append('${f.name}', typeof v === 'string' ? v : JSON.stringify(v));`
				);
				lines.push("        }");
				break;
			case "string":
				lines.push(
					`        if (${read} !== undefined) formData.append('${f.name}', String(resolveFileToken(${read} as string | undefined, '${flag}', 'text') ?? ''));`
				);
				break;
			default:
				lines.push(
					`        if (${read} !== undefined) formData.append('${f.name}', String(${read}));`
				);
		}
	}
	const url = `\`${ctx.resolvedRequestPath}\``;
	if (ctx.isRawOutput) {
		const parts = ["body: formData"];
		if (ctx.hasHeaders) {
			parts.push(`headers: ${HEADERS_GUARDED}`);
		}
		lines.push(...emitRawTail(ctx, "        ", url, parts));
	} else {
		const opts = renderOpts([
			["body", "formData", false],
			["headers", HEADERS_GUARDED, !ctx.hasHeaders],
		]);
		lines.push(
			`        const result = ${wrapAwait(ctx, requestApi(ctx, url, opts))};`
		);
		lines.push(formatOutputCall(ctx, "        "));
		lines.push("        return;");
	}
	lines.push("      }");
	return lines;
}

function fileUpload(ctx: Ctx): string[] {
	const d = ctx.derived;
	if (!d.hasFileUpload) {
		return [];
	}
	const cts = ctx.op.requestContentTypes;
	if (d.multipart !== undefined && !cts.includes("application/octet-stream")) {
		return [];
	}
	const lines = [
		"",
		"      if (argv.file) {",
		"        const fileContent = readFileForFlag(argv.file);",
	];
	const primary =
		cts.find((c) => c !== "application/json") ?? "application/octet-stream";
	const url = `\`${ctx.resolvedRequestPath}\``;
	if (primary === "multipart/form-data") {
		const field = d.multipart?.payloadField ?? "file";
		lines.push("        const formData = new FormData();");
		lines.push(
			`        formData.append('${field}', new Blob([fileContent]), argv.file.split(/[\\\\/]/).filter(Boolean).pop());`
		);
		if (ctx.isRawOutput) {
			const parts = ["body: formData"];
			if (ctx.hasHeaders) {
				parts.push(`headers: ${HEADERS_GUARDED}`);
			}
			lines.push(...emitRawTail(ctx, "        ", url, parts));
		} else {
			const opts = renderOpts([
				["body", "formData", false],
				["headers", HEADERS_GUARDED, !ctx.hasHeaders],
			]);
			lines.push(
				`        const result = ${wrapAwait(ctx, requestApi(ctx, url, opts))};`
			);
			lines.push(formatOutputCall(ctx, "        "));
			lines.push("        return;");
		}
	} else if (ctx.isRawOutput) {
		const parts = ["body: fileContent", `contentType: '${primary}'`];
		if (ctx.hasHeaders) {
			parts.push(`headers: ${HEADERS_GUARDED}`);
		}
		lines.push(...emitRawTail(ctx, "        ", url, parts));
	} else {
		const ct = ctx.hasHeaders
			? `{ 'Content-Type': '${primary}', ...${HEADERS_GUARDED} }`
			: `{ 'Content-Type': '${primary}' }`;
		const opts = renderOpts([
			["body", "fileContent", false],
			["headers", ct, false],
		]);
		lines.push(
			`        const result = ${wrapAwait(ctx, requestApi(ctx, url, opts))};`
		);
		lines.push(formatOutputCall(ctx, "        "));
		lines.push("        return;");
	}
	lines.push("      }");
	return lines;
}

function batchSize(op: OperationInfo): number | undefined {
	return op.maxItems !== undefined && op.maxItems > 0 ? op.maxItems : undefined;
}

export function bodyBypassUsesRequestApi(ctx: Ctx): boolean {
	if (!ctx.derived.hasBody || ctx.isRawOutput) {
		return false;
	}
	return !(
		acceptsJson(ctx) &&
		batchSize(ctx.op) === undefined &&
		sdk.canEmitTypedJsonBodyCall(ctx)
	);
}

function bodyBypass(ctx: Ctx): string[] {
	if (!ctx.derived.hasBody) {
		return [];
	}
	const op = ctx.op;
	const json = acceptsJson(ctx);
	const rawCt =
		op.requestContentTypes.find((c) => c !== "application/json") ??
		"application/octet-stream";
	const batch = batchSize(op);
	const lines = ["", "      if (argv.body) {"];
	if (json) {
		lines.push(`        const bodyData = ${parseBodyExpression(ctx)};`);
	} else {
		lines.push(
			"        // Endpoint does not accept application/json — send --body as raw bytes,"
		);
		lines.push(
			"        // resolving @file references as binary file contents."
		);
		lines.push(
			"        const bodyData = resolveFileToken(argv.body, 'body', 'binary');"
		);
	}
	const headerParts = json ? [] : [`'Content-Type': '${rawCt}'`];
	let headerOpt: string | undefined;
	if (ctx.hasHeaders) {
		headerOpt =
			headerParts.length === 0
				? HEADERS_GUARDED
				: `{ ${headerParts.join(", ")}, ...headers }`;
	} else if (headerParts.length > 0) {
		headerOpt = `{ ${headerParts.join(", ")} }`;
	}
	let url = `\`${ctx.resolvedRequestPath}\``;
	if (ctx.hasParams) {
		lines.push(`        const qs = ${QS_FROM_PARAMS};`);
		url = `\`${ctx.resolvedRequestPath}\${qs ? '?' + qs : ''}\``;
	}
	if (batch !== undefined && !ctx.isRawOutput) {
		const size = String(batch);
		lines.push(
			`        if (Array.isArray(bodyData) && bodyData.length > ${size}) {`
		);
		lines.push(`          const total = Math.ceil(bodyData.length / ${size});`);
		lines.push("          let result: unknown = null;");
		lines.push(
			`          for (let i = 0; i < bodyData.length; i += ${size}) {`
		);
		lines.push(`            const batch = bodyData.slice(i, i + ${size});`);
		lines.push(`            const batchNum = Math.floor(i / ${size}) + 1;`);
		const opts =
			headerOpt !== undefined
				? `{ body: batch, headers: ${headerOpt} }`
				: "{ body: batch }";
		lines.push(
			`            result = await withProgress(\`${escapeTemplate(ctx.progressLabel)}: batch \${batchNum}/\${total}\`, async () => (${requestApi(ctx, url, opts)}));`
		);
		lines.push("          }");
		lines.push(formatOutputCall(ctx, "          "));
		lines.push("          return;");
		lines.push("        }");
	}
	if (ctx.isRawOutput) {
		const parts = json
			? ["body: JSON.stringify(bodyData)", "contentType: 'application/json'"]
			: ["body: bodyData", `contentType: '${rawCt}'`];
		if (ctx.hasHeaders) {
			parts.push(`headers: ${HEADERS_GUARDED}`);
		}
		lines.push(...emitRawTail(ctx, "        ", url, parts));
	} else if (json && batch === undefined && sdk.canEmitTypedJsonBodyCall(ctx)) {
		lines.push(`        const result = ${wrapAwait(ctx, sdk.bodyCall(ctx))};`);
		lines.push(formatOutputCall(ctx, "        "));
		lines.push("        return;");
	} else {
		const opts =
			headerOpt !== undefined
				? `{ body: bodyData, headers: ${headerOpt} }`
				: "{ body: bodyData }";
		lines.push(
			`        const result = ${wrapAwait(ctx, requestApi(ctx, url, opts))};`
		);
		lines.push(formatOutputCall(ctx, "        "));
		lines.push("        return;");
	}
	lines.push("      }");
	return lines;
}

export function bodyPrompts(ctx: Ctx): string[] {
	const lines: string[] = [];
	if (ctx.derived.hasBodyParams) {
		for (const arg of bodyOptions(ctx.derived)) {
			if (!arg.required) {
				continue;
			}
			const desc = escapeSingle(arg.description);
			const read = argvKey(arg.name);
			lines.push(`      if (${read} === undefined) {`);
			if (arg.choices !== undefined && arg.choices.length > 0) {
				const list = arg.choices.map((c) => `'${escapeSingle(c)}'`).join(", ");
				lines.push(
					`        ${read} = await promptForRequiredEnumField('${arg.name}', '${desc}', [${list}] as const);`
				);
			} else if (arg.type === "string") {
				const opts = arg.secret ? ", { kind: 'secret' }" : "";
				lines.push(
					`        ${read} = await promptForRequiredField('${arg.name}', '${desc}'${opts});`
				);
			} else {
				lines.push(
					`        throw new Error('--${arg.name} is required (or pass --body with this field set).');`
				);
			}
			lines.push("      }");
		}
	}
	if (ctx.variantPromptBlock.length > 0) {
		lines.push("");
		lines.push(...ctx.variantPromptBlock);
	}
	return lines;
}

/**
 * The non-path positionals and required options that go into the body, as
 * their argument definitions and API field names.
 */
function bodyFieldArgs(ctx: Ctx): [Arg, string][] {
	const out: [Arg, string][] = [];
	for (const arg of positionals(ctx.derived)) {
		if (isPath(arg) || arg.isZone || arg.isWorkerName) {
			continue;
		}
		const path = bodyPath(arg);
		const field =
			path !== undefined && path.length === 1
				? (path[0] as string)
				: arg.name.replaceAll("-", "_");
		out.push([arg, field]);
	}
	for (const opt of ctx.requiredOptionArgs) {
		if (isBody(opt)) {
			continue;
		}
		out.push([opt, opt.name.replaceAll("-", "_")]);
	}
	return out;
}

/** `emitBodyArgValue`. */
function bodyArgValue(arg: Arg, read: string): string {
	if (arg.type === "scalarUnion") {
		return `parseScalarValue(${read}, ${quote(arg.name)})`;
	}
	if (arg.type === "objectArray") {
		return `parseObjectArray(${read}, ${quote(arg.name)})`;
	}
	if (arg.type === "nestedArray") {
		return `parseNestedArray(${read}, ${quote(arg.name)})`;
	}
	if (arg.type === "objectMap") {
		return `parseJsonMap(${read}, ${quote(arg.name)}${arg.required ? ", true" : ""})`;
	}
	// Enum flags resolve `@file` in their builder's coerce, before validation.
	if (arg.fromFile !== undefined && !hasChoices(arg)) {
		return `resolveFileToken(${read} as string | undefined, ${quote(arg.name)}, ${fileFormat(arg)})`;
	}
	return read;
}

interface Tree {
	value?: string;
	children: [string, Tree][];
}

/** `emitBodyObject`. */
export function bodyObject(ctx: Ctx, indent: string): string[] {
	const root: Tree = { children: [] };
	const add = (segments: readonly string[], value: string) => {
		let node = root;
		for (const segment of segments) {
			let child = node.children.find(([n]) => n === segment)?.[1];
			if (!child) {
				child = { children: [] };
				node.children.push([segment, child]);
			}
			node = child;
		}
		node.value = value;
	};
	for (const arg of bodyOptions(ctx.derived)) {
		const path = bodyPath(arg);
		if (path === undefined) {
			continue;
		}
		add(path, bodyArgValue(arg, argvKey(arg.name)));
	}
	for (const [arg, field] of bodyFieldArgs(ctx)) {
		add([field], bodyArgValue(arg, argvKey(arg.name)));
	}
	const emit = (tree: Tree, ind: string): string[] => {
		const lines = ["{"];
		for (const [name, child] of tree.children) {
			const key = isIdentifier(name) ? name : quote(name);
			if (child.children.length === 0) {
				lines.push(`${ind}\t${key}: ${child.value ?? "undefined"},`);
				continue;
			}
			const nestedLines = emit(child, `${ind}\t`);
			lines.push(`${ind}\t${key}: ${nestedLines[0]}`);
			lines.push(...nestedLines.slice(1, nestedLines.length - 1));
			lines.push(`${ind}\t},`);
		}
		lines.push(`${ind}}`);
		return lines;
	};
	return emit(root, indent);
}

export function sdkCallUsesRequestApi(ctx: Ctx): boolean {
	if (ctx.isRawOutput) {
		return false;
	}
	if (ctx.derived.hasBodyParams) {
		return !sdk.canEmitTypedBodyCall(ctx);
	}
	const typed = sdk.canEmitTypedCall(ctx);
	return !bodyUnsatisfiable(ctx, typed) && !typed;
}

/**
 * Whether a command without body flags needs `--body`: its body has a shape
 * to fill in, or is required and has fields, and a typed call can't send it.
 */
function bodyUnsatisfiable(ctx: Ctx, typed: boolean): boolean {
	const d = ctx.derived;
	return (
		d.hasBody && (!d.hasEmptyBody || ctx.op.requestBodyMandatory) && !typed
	);
}

function bodyAssembly(ctx: Ctx): string[] {
	const lines = ["", "      // Assemble request body from individual flags"];
	const typed = sdk.canEmitTypedBodyCall(ctx);
	if (typed) {
		lines.push("      const bodyData = compactBody(");
		const object = bodyObject(ctx, "\t\t");
		object[object.length - 1] += preservedBodyPaths(ctx);
		for (const line of object) {
			lines.push(`        ${line}`);
		}
		lines.push("      );");
	} else {
		lines.push("      const bodyData: Record<string, unknown> = {};");
		for (const arg of bodyOptions(ctx.derived)) {
			const path = bodyPath(arg);
			if (path === undefined) {
				continue;
			}
			const p = path.map(quote).join(", ");
			const read = argvKey(arg.name);
			const value = bodyArgValue(arg, read);
			lines.push(
				`      if (${read} !== undefined) setNestedValue(bodyData, [${p}], ${value});`
			);
		}
		for (const [arg, field] of bodyFieldArgs(ctx)) {
			const read = argvKey(arg.name);
			const value = bodyArgValue(arg, read);
			lines.push(
				`      if (${read} !== undefined) bodyData[${quote(field)}] = ${value};`
			);
		}
	}
	// Like a typed call, which sends a body that needs none of its fields
	// empty, rather than leaving it out.
	const opts = ["body: bodyData"];
	if (ctx.hasHeaders) {
		opts.push(`headers: ${HEADERS_GUARDED}`);
	}
	let url = `\`${ctx.resolvedRequestPath}\``;
	if (ctx.hasParams) {
		lines.push(`      const qs = ${QS_FROM_PARAMS};`);
		url = `\`${ctx.resolvedRequestPath}\${qs ? '?' + qs : ''}\``;
	}
	if (ctx.isRawOutput) {
		const parts = [
			"body: Object.keys(bodyData).length > 0 ? bodyData : undefined",
		];
		if (ctx.hasHeaders) {
			parts.push(`headers: ${HEADERS_GUARDED}`);
		}
		lines.push(...emitRawTail(ctx, "      ", url, parts));
	} else if (typed) {
		lines.push(`      const result = ${wrapAwait(ctx, sdk.bodyCall(ctx))};`);
		lines.push(formatOutputCall(ctx, "      "));
	} else {
		lines.push(
			`      const result = ${wrapAwait(ctx, requestApi(ctx, url, `{ ${opts.join(", ")} }`))};`
		);
		lines.push(formatOutputCall(ctx, "      "));
	}
	return lines;
}

function plainCall(ctx: Ctx): string[] {
	const d = ctx.derived;
	const lines = [""];
	const typed = sdk.canEmitTypedCall(ctx);
	const unsatisfiable = bodyUnsatisfiable(ctx, typed);
	if (unsatisfiable) {
		lines.push("      if (argv.body === undefined) {");
		lines.push(
			"        throw new Error('--body is required for this command. Pass --body \\'<json>\\' or --body @path/to/file.json.');"
		);
		lines.push("      }");
	}
	if (ctx.isRawOutput) {
		let url = `\`${ctx.resolvedRequestPath}\``;
		if (ctx.hasParams) {
			lines.push(`      const qs = ${QS_FROM_PARAMS};`);
			url = `\`${ctx.resolvedRequestPath}\${qs ? '?' + qs : ''}\``;
		}
		const parts = ctx.hasHeaders ? [`headers: ${HEADERS_GUARDED}`] : [];
		lines.push(...emitRawTail(ctx, "      ", url, parts));
	}
	if (!ctx.isRawOutput && !unsatisfiable) {
		const url = `\`${ctx.resolvedRequestPath}\``;
		if (ctx.hasHeaders) {
			const opts: string[] = [];
			if (d.hasBody) {
				const fields = bodyFieldArgs(ctx).map(
					([arg, field]) =>
						`'${field}': ${bodyArgValue(arg, argvKey(arg.name))}`
				);
				if (fields.length > 0) {
					opts.push(`body: { ${fields.join(", ")} }`);
				}
			}
			if (ctx.hasParams) {
				opts.push("query: queryParams");
			}
			opts.push(`headers: ${HEADERS_GUARDED}`);
			lines.push(
				`      const result = ${wrapAwait(ctx, requestApi(ctx, url, `{ ${opts.join(", ")} }`))};`
			);
		} else if (typed) {
			lines.push(`      const result = ${wrapAwait(ctx, sdk.typedCall(ctx))};`);
		} else {
			const opts = ctx.hasParams ? "{ query: queryParams }" : "";
			lines.push(
				`      const result = ${wrapAwait(ctx, requestApi(ctx, url, opts))};`
			);
		}
		lines.push(formatOutputCall(ctx, "      "));
	}
	return lines;
}

/** `computeVariantPromptBlock`. */
export function variantPromptBlock(
	op: OperationInfo,
	bodyFields: readonly Arg[]
): [string[], boolean] {
	const disc = op.bodyDiscriminator;
	if (!disc) {
		return [[], false];
	}
	const apiToFlag: [string, string][] = [];
	const available: string[] = [];
	const descriptions: [string, string][] = [];
	for (const a of bodyFields) {
		const path = bodyPath(a);
		if (path === undefined || path.length === 0) {
			continue;
		}
		const head = path[0] as string;
		pushUnique(available, head);
		if (path.length !== 1) {
			continue;
		}
		setEntry(apiToFlag, head, a.name);
		if (a.description !== "") {
			setEntry(descriptions, a.name, a.description);
		}
	}
	const flagOf = (f: string) => apiToFlag.find(([k]) => k === f)?.[1];
	const byKebab = (f: string) => {
		for (let i = bodyFields.length - 1; i >= 0; i--) {
			const a = bodyFields[i] as Arg;
			if (a.name === f) {
				return a;
			}
		}
		return undefined;
	};
	const discFlag = flagOf(disc.field);
	if (discFlag === undefined) {
		return [[], false];
	}
	const discRead = argvKey(discFlag);
	const block: string[] = [];
	let needsText = false;
	for (const [value, fields] of disc.variants) {
		const valueEsc = escapeSingle(value);
		const unavailable = fields.filter((f) => !available.includes(f));
		if (unavailable.length > 0) {
			const list = unavailable.join(", ");
			block.push(`      if (${discRead} === '${valueEsc}') {`);
			block.push(
				`        throw new Error('The ${valueEsc} variant requires ${escapeSingle(list)}, which cannot be supplied as flags. Pass --body with a complete request body.');`
			);
			block.push("      }");
			continue;
		}
		const flags = fields
			.map(flagOf)
			.filter((f): f is string => f !== undefined && f !== "");
		for (const flag of flags) {
			const read = argvKey(flag);
			const arg = byKebab(flag);
			const desc =
				descriptions.find(([k]) => k === flag)?.[1] ?? `value for --${flag}`;
			block.push(
				`      if (${discRead} === '${valueEsc}' && ${read} === undefined) {`
			);
			if (arg?.type !== "string" && arg?.type !== "enum") {
				block.push(
					`        throw new Error('--${flag} is required (or pass --body with this field set).');`
				);
				block.push("      }");
				continue;
			}
			needsText = true;
			const opts = arg.secret
				? `{ kind: 'secret', question: 'Enter value for --${flag}' }`
				: `{ question: 'Enter value for --${flag}' }`;
			block.push(
				`        ${read} = await promptForRequiredField('${flag}', '${escapeSingle(desc)}', ${opts});`
			);
			block.push("      }");
		}
	}
	return [block, needsText];
}

/** The imports of a command, in the order cf rendered them. */
export class Imports {
	private readonly typed: [string, Set<string>][] = [];
	private readonly named: [string, Set<string>][] = [];
	private readonly defaults: [string, string][] = [];

	private static add(
		list: [string, Set<string>][],
		path: string,
		names: readonly string[]
	): void {
		let entry = list.find(([p]) => p === path);
		if (!entry) {
			entry = [path, new Set()];
			list.push(entry);
		}
		for (const name of names) {
			entry[1].add(name);
		}
	}

	from(path: string, names: readonly string[]): void {
		Imports.add(this.named, path, names);
	}

	typeFrom(path: string, names: readonly string[]): void {
		Imports.add(this.typed, path, names);
	}

	/** Imports the default export of `path` as `name`. */
	defaultFrom(path: string, name: string): void {
		this.defaults.push([name, path]);
	}

	render(): string[] {
		const lines: string[] = [];
		const sorted = (names: Set<string>) => [...names].sort(codeUnitCompare);
		for (const [path, names] of this.typed) {
			if (names.size > 0) {
				lines.push(
					`import type { ${sorted(names).join(", ")} } from '${path}';`
				);
			}
		}
		for (const [path, names] of this.named) {
			if (names.size > 0) {
				lines.push(`import { ${sorted(names).join(", ")} } from '${path}';`);
			}
		}
		for (const [name, path] of this.defaults) {
			lines.push(`import ${name} from '${path}';`);
		}
		return lines;
	}
}

/** `buildImportSet`. */
export function imports(ctx: Ctx): Imports {
	const d = ctx.derived;
	const i = new Imports();
	const lib = "#lib";
	i.typeFrom("yargs", ["Argv", "CommandModule"]);
	i.typeFrom(`${lib}/cli-types.js`, ["CommonYargsOptions", "InferArgs"]);
	const authNames = ["createCommandClient"];
	if (ctx.needsAccountId) {
		authNames.push("getAccountId", "resolveAccountIdSilent");
	}
	if (ctx.needsZoneId) {
		authNames.push("getZoneId");
	}
	if (ctx.needsWorkerName) {
		authNames.push("getWorkerName");
	}
	if (bodyBypassUsesRequestApi(ctx) || sdkCallUsesRequestApi(ctx)) {
		authNames.push("requestApi");
	}
	i.from(`${lib}/auth.js`, authNames);
	if (ctx.needsAccountId) {
		i.from(`${lib}/local.js`, ["LOCAL_ACCOUNT_ID"]);
	}
	i.from(`${lib}/output.js`, ["formatOutput"]);
	i.from(`${lib}/dry-run.js`, ["formatDryRun"]);
	i.from(`${lib}/progress.js`, ["withProgress"]);
	i.from(`${lib}/telemetry/index.js`, ["runWithTelemetry"]);
	i.typeFrom(`${lib}/telemetry/index.js`, ["ArgClassification"]);
	if (ctx.outputKind === "binary" || ctx.outputKind === "text") {
		i.from(`${lib}/raw-fetch.js`, ["fetchRawBytes", "writeRawOutput"]);
	}
	const bodyFlags = bodyOptions(d);
	const bodyArgs = [...bodyFlags, ...bodyFieldArgs(ctx).map(([arg]) => arg)];
	const flagsNeedToken = bodyArgs.some((a) => a.fromFile !== undefined);
	const nonJsonBody = d.hasBody && !acceptsJson(ctx);
	const needsToken =
		flagsNeedToken || d.multipartFlagFields.length > 0 || nonJsonBody;
	if (needsToken || d.hasFileUpload) {
		const names: string[] = [];
		if (needsToken) {
			names.push("resolveFileToken");
		}
		if (d.hasFileUpload) {
			names.push("readFileForFlag");
		}
		i.from(`${lib}/input-validation.js`, names);
	}
	if (d.hasBody || d.hasBodyParams) {
		const names: string[] = [];
		if (d.hasBody) {
			names.push("parseBody");
		}
		if (d.hasBodyParams) {
			names.push("compactBody");
		}
		if (bodyArgs.some((a) => a.type === "objectMap")) {
			names.push("parseJsonMap");
		}
		if (bodyArgs.some((a) => a.type === "objectArray")) {
			names.push("parseObjectArray");
		}
		if (bodyArgs.some((a) => a.type === "nestedArray")) {
			names.push("parseNestedArray");
		}
		if (bodyArgs.some((a) => a.type === "scalarUnion")) {
			names.push("parseScalarValue");
		}
		if (d.hasBodyParams && !sdk.canEmitTypedBodyCall(ctx)) {
			names.push("setNestedValue");
		}
		i.from(`${lib}/body-parser.js`, names);
	}
	let text = ctx.variantPromptNeedsText;
	let enumerated = false;
	for (const a of bodyFlags) {
		if (!a.required) {
			continue;
		}
		if (a.choices !== undefined && a.choices.length > 0) {
			enumerated = true;
		} else if (a.type === "string") {
			text = true;
		}
	}
	if (text || enumerated || ctx.isDelete) {
		const names: string[] = [];
		if (text) {
			names.push("promptForRequiredField");
		}
		if (enumerated) {
			names.push("promptForRequiredEnumField");
		}
		if (ctx.isDelete) {
			names.push("confirmDelete");
		}
		i.from(`${lib}/prompt.js`, names);
	}
	if (sdk.makesTypedCall(ctx)) {
		i.defaultFrom(sdk.operationModule(ctx), "operation");
	}
	return i;
}
