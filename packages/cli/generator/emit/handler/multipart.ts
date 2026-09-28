/**
 * Emit the multipart/form-data bypass block.
 *
 * Triggers when the user passes ANY multipart-specific flag
 * (`--metadata`, `--creator`, `--id`, etc.) OR the endpoint's primary
 * non-JSON content type is multipart/form-data. Assembles a `FormData`
 * payload with the payload field (from `--body` or `--file`) plus
 * extra fields from the auto-emitted flags.
 *
 * Returns early after the API call (the regular SDK call path is
 * skipped when the multipart branch fires).
 */
import { toKebabCase } from "@cloudflare/forge";
import { argvKey } from "../../codegen/identifiers.js";
import {
	HEADERS_GUARDED_EXPR,
	renderOpts,
} from "../../codegen/opts-builder.js";
import type { EmitContext } from "../context.js";

export function emitMultipart(ctx: EmitContext): string[] {
	const {
		opInfo,
		derived,
		hasHeaders,
		resolvedRequestPath,
		formatOutputCall,
		wrapAwait,
		isRawOutput,
		emitRawTail,
	} = ctx;
	const { multipartInfo, multipartFlagFields } = derived;

	if (!multipartInfo) return [];

	const flagReads = multipartFlagFields.map((f) =>
		argvKey(toKebabCase(f.name))
	);
	const anyFlagExpr =
		flagReads.length > 0
			? flagReads.map((r) => `${r} !== undefined`).join(" || ")
			: "false";
	// Only enter this path when a multipart flag is set (presence of at
	// least one differentiates it from the plain --file/--body path).
	const multipartOnly = !opInfo.requestContentTypes.includes(
		"application/octet-stream"
	);
	const guard = multipartOnly
		? flagReads.length > 0
			? `(argv.file !== undefined) || (argv.body !== undefined) || ${anyFlagExpr}`
			: "(argv.file !== undefined) || (argv.body !== undefined)"
		: flagReads.length > 0
			? anyFlagExpr
			: "false";

	if (guard === "false") return [];

	const lines: string[] = [];
	lines.push(``);
	lines.push(`      if (${guard}) {`);
	lines.push(`        const formData = new FormData();`);
	// Append the payload field (from --file or --body). Field name comes
	// from the multipart schema's payload field; falls back to 'file'.
	const payloadName = multipartInfo.payloadField ?? "file";
	lines.push(`        if (argv.file) {`);
	lines.push(`          const fileContent = readFileForFlag(argv.file);`);
	lines.push(
		`          formData.append('${payloadName}', new Blob([fileContent]), argv.file.split(/[\\\\/]/).filter(Boolean).pop());`
	);
	lines.push(`        } else if (argv.body !== undefined) {`);
	lines.push(`          formData.append('${payloadName}', argv.body);`);
	lines.push(`        }`);
	// Append each non-payload multipart flag that's set.
	for (const f of multipartFlagFields) {
		const flagName = toKebabCase(f.name);
		const read = argvKey(flagName);
		if (f.type === "object" || f.type === "array") {
			lines.push(`        if (${read} !== undefined) {`);
			lines.push(
				`          const v = typeof ${read} === 'string' ? resolveFileToken(${read}, '${flagName}', 'text') : ${read};`
			);
			lines.push(
				`          formData.append('${f.name}', typeof v === 'string' ? v : JSON.stringify(v));`
			);
			lines.push(`        }`);
		} else if (f.type === "string") {
			lines.push(
				`        if (${read} !== undefined) formData.append('${f.name}', String(resolveFileToken(${read} as string | undefined, '${flagName}', 'text') ?? ''));`
			);
		} else {
			// Numbers, booleans — no @file resolution.
			lines.push(
				`        if (${read} !== undefined) formData.append('${f.name}', String(${read}));`
			);
		}
	}
	if (isRawOutput) {
		const rawParts = ["body: formData"];
		if (hasHeaders) rawParts.push(`headers: ${HEADERS_GUARDED_EXPR}`);
		for (const l of emitRawTail(
			"        ",
			`\`${resolvedRequestPath}\``,
			rawParts
		)) {
			lines.push(l);
		}
	} else {
		const mpOpts = renderOpts([
			{ key: "body", expr: "formData" },
			{ key: "headers", expr: HEADERS_GUARDED_EXPR, omit: !hasHeaders },
		]);
		lines.push(
			`        const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, \`${resolvedRequestPath}\`, ${mpOpts})`)};`
		);
		lines.push(formatOutputCall("        "));
		lines.push(`        return;`);
	}
	lines.push(`      }`);

	return lines;
}
