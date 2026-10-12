import { argvKey } from "../../codegen/identifiers.js";
/**
 * Emit the terminal API call — the request that actually hits the API
 * when no earlier early-return bypass (multipart / `--file` / `--body`)
 * fired.
 *
 * Two mutually-exclusive shapes, selected by whether the op has
 * auto-emitted per-field body flags:
 *
 *   - **`hasBodyParams`** → assemble the JSON body from individual
 *     flags (`setNestedValue` per body arg) so nested API fields
 *     (`from.name`) are reconstructed from the flat CLI surface
 *     (`--from-name`), then issue the call.
 *   - **`!hasBodyParams`** → the fallback path: throw on an
 *     unsatisfiable required body, stream raw-output responses, drop to
 *     a passthrough `requestApi` call for header-bearing ops, else a
 *     typed `client.send(operation, request)` call.
 *
 * Both shapes share: folding non-path positional + required-option args
 * into the body (see {@link bodyFieldArgs}), raw-output streaming via
 * the shared `emitRawTail` helper, query string appended to the URL
 * (body-bearing requests can't pass query in the options bag), and the
 * trailing `formatOutput`. Keeping them in one emitter keeps that
 * shared path/body/query/raw logic in a single place.
 */
import {
	HEADERS_GUARDED_EXPR,
	QS_FROM_PARAMS_EXPR,
} from "../../codegen/opts-builder.js";
import {
	bodyOptionArgs,
	isPathArg,
	positionalArgs,
} from "../../intermediate-representation.js";
import {
	canEmitTypedBodyCall,
	canEmitTypedCall,
	typedBodyCall,
	typedCall,
} from "../typed-call.js";
import { emitBodyArgValue, emitBodyObject } from "./body-object.js";
import type { EmitContext } from "../context.js";

/**
 * Non-path positional args + required option args that fold into the
 * request body. Shared by both API-call shapes. Returns each
 * contributing arg's kebab argv read key plus its snake_cased API field
 * name (the wire key both shapes use).
 */
function bodyFieldArgs(
	ctx: EmitContext
): { argKey: string; apiFieldName: string }[] {
	const { derived, requiredOptionArgs } = ctx;
	const out: { argKey: string; apiFieldName: string }[] = [];
	for (const arg of positionalArgs(derived.args)) {
		if (isPathArg(arg)) continue;
		if (arg.isZone) continue;
		if (arg.isWorkerName) continue;
		// Prefer the API field path over the flag spelling, which
		// `x-fern-property-name` may rename. Promoted positionals always
		// have a length-1 body apiFieldPath.
		const apiFieldName =
			arg.origin.kind === "body" && arg.origin.apiFieldPath.length === 1
				? arg.origin.apiFieldPath[0]!
				: arg.name.replace(/-/g, "_");
		out.push({
			argKey: arg.name,
			apiFieldName,
		});
	}
	for (const opt of requiredOptionArgs) {
		// Body-param flags are assembled by the loop above; skip them here.
		if (opt.origin.kind === "body") continue;
		out.push({
			argKey: opt.name,
			apiFieldName: opt.name.replace(/-/g, "_"),
		});
	}
	return out;
}

/**
 * Whether a command without body flags needs `--body`: its body has a shape
 * to fill in, or is required and has fields, and a typed call can't send it.
 */
function bodyRequiredAndUnsatisfiable(
	ctx: EmitContext,
	typed: boolean
): boolean {
	const { hasBody, hasEmptyBody } = ctx.derived;
	return hasBody && (!hasEmptyBody || ctx.wire.requestBodyMandatory) && !typed;
}

export function apiCallUsesRequestApi(ctx: EmitContext): boolean {
	if (ctx.isRawOutput) return false;
	if (ctx.derived.hasBodyParams) return !canEmitTypedBodyCall(ctx);
	const typed = canEmitTypedCall(ctx);
	return !bodyRequiredAndUnsatisfiable(ctx, typed) && !typed;
}
export function emitApiCall(ctx: EmitContext): string[] {
	const { derived } = ctx;
	return derived.hasBodyParams ? emitBodyAssembly(ctx) : emitPlainApiCall(ctx);
}

/**
 * Per-flag body assembly + the API call that consumes it (the
 * `hasBodyParams` shape).
 */
function emitBodyAssembly(ctx: EmitContext): string[] {
	const {
		opInfo,
		derived,
		hasHeaders,
		hasParams,
		isRawOutput,
		resolvedRequestPath,
		formatOutputCall,
		wrapAwait,
		emitRawTail,
	} = ctx;

	const lines: string[] = [];
	lines.push(``);
	lines.push(`      // Assemble request body from individual flags`);
	if (canEmitTypedBodyCall(ctx)) {
		lines.push(`      const bodyData = compactBody(`);
		for (const line of emitBodyObject(ctx, "\t\t")) {
			lines.push(`        ${line}`);
		}
		lines.push(`      );`);
	} else {
		lines.push(`      const bodyData: Record<string, unknown> = {};`);
		for (const arg of bodyOptionArgs(derived.args)) {
			if (arg.origin.kind !== "body") continue;
			const path = arg.origin.apiFieldPath
				.map((segment) => JSON.stringify(segment))
				.join(", ");
			const read = argvKey(arg.name);
			const value = emitBodyArgValue(arg, read);
			lines.push(
				"      if (" +
					read +
					" !== undefined) setNestedValue(bodyData, [" +
					path +
					"], " +
					value +
					");"
			);
		}
		for (const field of bodyFieldArgs(ctx)) {
			const read = argvKey(field.argKey);
			lines.push(
				"      if (" +
					read +
					" !== undefined) bodyData[" +
					JSON.stringify(field.apiFieldName) +
					"] = " +
					read +
					";"
			);
		}
	}

	// Like a typed call, which sends a body that needs none of its fields
	// empty, rather than leaving it out.
	const bodyAssemblyOpts: string[] = ["body: bodyData"];
	if (hasHeaders) bodyAssemblyOpts.push(`headers: ${HEADERS_GUARDED_EXPR}`);

	// Body-bearing requests can't put query params in options — append
	// them to the URL.
	let bodyAssemblyUrl = `\`${resolvedRequestPath}\``;
	if (hasParams) {
		lines.push(`      const qs = ${QS_FROM_PARAMS_EXPR};`);
		bodyAssemblyUrl = `\`${resolvedRequestPath}\${qs ? '?' + qs : ''}\``;
	}

	if (isRawOutput) {
		// Binary / text response: send the assembled JSON body but stream
		// response bytes to stdout instead of JSON-decoding them.
		const rawBodyParts = [
			"body: Object.keys(bodyData).length > 0 ? bodyData : undefined",
		];
		if (hasHeaders) rawBodyParts.push(`headers: ${HEADERS_GUARDED_EXPR}`);
		for (const l of emitRawTail("      ", bodyAssemblyUrl, rawBodyParts)) {
			lines.push(l);
		}
	} else if (canEmitTypedBodyCall(ctx)) {
		lines.push(`      const result = ${wrapAwait(typedBodyCall(ctx))};`);
		lines.push(formatOutputCall("      "));
	} else {
		lines.push(
			`      const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, ${bodyAssemblyUrl}, { ${bodyAssemblyOpts.join(", ")} })`)};`
		);
		lines.push(formatOutputCall("      "));
	}

	return lines;
}

/**
 * The fallback API-call block for commands WITHOUT auto-generated body
 * params (the `!hasBodyParams` shape).
 *
 * Sub-shapes:
 *   - `--body required` and no per-field path: throw a clear error.
 *   - Raw-output response (binary/text): pipe response bytes via the
 *     shared `emitRawTail` helper.
 *   - Header-bearing requests (and a few specialised body shapes): go
 *     through `requestApi` with a manual options bag.
 *   - Everything else: a typed `client.send` call when the operation's
 *     request can be filled in, otherwise the authenticated passthrough
 *     fetch.
 */
function emitPlainApiCall(ctx: EmitContext): string[] {
	const {
		opInfo,
		derived,
		hasHeaders,
		hasParams,
		isRawOutput,
		resolvedRequestPath,
		formatOutputCall,
		wrapAwait,
		emitRawTail,
	} = ctx;
	const { hasBody } = derived;

	const lines: string[] = [];
	lines.push(``);

	// If the API requires a request body but the user supplied neither
	// `--body` nor any per-field body flag, bail out with a clear error
	// before sending an empty payload (which the API would reject with
	// an opaque 400).
	const typed = canEmitTypedCall(ctx);
	const unsatisfiable = bodyRequiredAndUnsatisfiable(ctx, typed);
	if (unsatisfiable) {
		lines.push(`      if (argv.body === undefined) {`);
		lines.push(
			`        throw new Error('--body is required for this command. Pass --body \\'<json>\\' or --body @path/to/file.json.');`
		);
		lines.push(`      }`);
	}

	// Raw-output branch: bypass the client (which JSON-decodes or
	// text-decodes) and pipe the response body straight to stdout.
	// `--text` on raw-bytes endpoints switches to UTF-8 decoded mode at
	// runtime. This is the bodyless case (GET, or POST whose payload
	// comes from `--body` and was handled by the body-bypass block
	// above); the per-field-body and `--body` raw paths emit earlier
	// via the same `emitRawTail` helper.
	if (isRawOutput) {
		let rawUrlExpr = `\`${resolvedRequestPath}\``;
		if (hasParams) {
			lines.push(`      const qs = ${QS_FROM_PARAMS_EXPR};`);
			rawUrlExpr = `\`${resolvedRequestPath}\${qs ? '?' + qs : ''}\``;
		}
		for (const l of emitRawTail("      ", rawUrlExpr, [])) {
			lines.push(l);
		}
	}

	// Skip the API call + formatOutput when the raw-output branch handled
	// the response, OR when the `--body required` throw above is
	// unconditional (the call would be dead code).
	if (!isRawOutput && !unsatisfiable) {
		if (hasHeaders) {
			const directOpts: string[] = [];
			if (hasBody) {
				// Build body from non-path positional args + required option
				// args.
				const bodyFields = bodyFieldArgs(ctx).map(
					({ argKey, apiFieldName }) => `'${apiFieldName}': ${argvKey(argKey)}`
				);
				if (bodyFields.length > 0) {
					directOpts.push(`body: { ${bodyFields.join(", ")} }`);
				}
			}
			// `queryParams` is always the query bag — route it to `query`
			// whether or not the op carries a body.
			if (hasParams) {
				directOpts.push(`query: queryParams`);
			}
			directOpts.push(`headers: ${HEADERS_GUARDED_EXPR}`);
			lines.push(
				`      const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, \`${resolvedRequestPath}\`, { ${directOpts.join(", ")} })`)};`
			);
		} else if (typed) {
			lines.push(`      const result = ${wrapAwait(typedCall(ctx))};`);
		} else {
			const passthroughOptions = hasParams ? ", { query: queryParams }" : "";
			lines.push(
				`      const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, \`${resolvedRequestPath}\`${passthroughOptions})`)};`
			);
		}
		lines.push(formatOutputCall("      "));
	}

	return lines;
}
