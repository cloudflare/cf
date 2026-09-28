/**
 * Emit the `--body` short-circuit block.
 *
 * Triggers when the op declares a request body and the user passes
 * `--body <value>` (or `--body @file`). Bypasses the per-field
 * assembly path entirely — the user's payload is forwarded verbatim.
 *
 * Sub-paths:
 *   - JSON body: parse with `parseBody` (which handles `@file`).
 *   - Non-JSON body: send raw bytes with the right Content-Type
 *     header. `@file` references are resolved as binary.
 *   - Array body with `maxItems` cap: split into N-sized batches and
 *     send sequentially, updating the spinner per batch.
 *   - Raw-output response (binary/text MIME): pipe response bytes
 *     straight to stdout via the shared `emitRawTail` helper.
 */
import {
	HEADERS_GUARDED_EXPR,
	QS_FROM_PARAMS_EXPR,
} from "../../codegen/opts-builder.js";
import { escapeForTemplateLiteral } from "../../util.js";
import {
	canEmitTypedJsonBodySdkCall,
	typedBodyType,
	typedParsedBodySdkCall,
} from "../sdk-path.js";
import type { EmitContext } from "../context.js";

export function bodyBypassUsesRequestApi(ctx: EmitContext): boolean {
	if (!ctx.derived.hasBody || ctx.isRawOutput) return false;
	const acceptsJson =
		ctx.opInfo.requestContentTypes.includes("application/json");
	const batchesBody =
		typeof ctx.opInfo.maxItems === "number" && ctx.opInfo.maxItems > 0;
	return !(acceptsJson && !batchesBody && canEmitTypedJsonBodySdkCall(ctx));
}
export function emitBodyBypass(ctx: EmitContext): string[] {
	const {
		opInfo,
		derived,
		hasHeaders,
		hasParams,
		isRawOutput,
		resolvedRequestPath,
		progressLabel,
		formatOutputCall,
		wrapAwait,
		emitRawTail,
	} = ctx;
	const { hasBody } = derived;

	if (!hasBody) return [];

	// Does this op accept application/json? If not, --body is raw bytes.
	const acceptsJson = opInfo.requestContentTypes.includes("application/json");
	// Pick the first non-JSON content type for the Content-Type header.
	const rawContentType =
		opInfo.requestContentTypes.find((ct) => ct !== "application/json") ??
		"application/octet-stream";
	// Forge can declare a max array-body size (KV bulk-update: 10000,
	// bulk-get: 100, etc.); split into batches when present.
	const batchSize =
		typeof opInfo.maxItems === "number" && opInfo.maxItems > 0
			? opInfo.maxItems
			: undefined;

	const lines: string[] = [];
	lines.push(``);
	lines.push(`      if (argv.body) {`);
	if (acceptsJson) {
		// parseBody handles `@file` for JSON-accepting endpoints (reads
		// as text, then JSON-parses).
		const bodyType = canEmitTypedJsonBodySdkCall(ctx)
			? "<" + typedBodyType(ctx) + ">"
			: "";
		lines.push(`        const bodyData = parseBody${bodyType}(argv.body);`);
	} else {
		lines.push(
			`        // Endpoint does not accept application/json — send --body as raw bytes,`
		);
		lines.push(
			`        // resolving @file references as binary file contents.`
		);
		lines.push(
			`        const bodyData = resolveFileToken(argv.body, 'body', 'binary');`
		);
	}

	// Headers: pick up any user-supplied header flags and, for raw-byte
	// bodies, force the right Content-Type so the API accepts them.
	const headerParts: string[] = [];
	if (!acceptsJson) headerParts.push(`'Content-Type': '${rawContentType}'`);
	const headerOptExpr = hasHeaders
		? headerParts.length > 0
			? `{ ${headerParts.join(", ")}, ...headers }`
			: HEADERS_GUARDED_EXPR
		: headerParts.length > 0
			? `{ ${headerParts.join(", ")} }`
			: null;

	// Forward query params to the URL when the user supplies --body.
	// (Body-bearing SDK options don't accept query — append to the URL.)
	let bodyBypassUrlExpr = `\`${resolvedRequestPath}\``;
	if (hasParams) {
		lines.push(`        const qs = ${QS_FROM_PARAMS_EXPR};`);
		bodyBypassUrlExpr = `\`${resolvedRequestPath}\${qs ? '?' + qs : ''}\``;
	}

	// Skip batching for raw-output endpoints: batching ends in
	// formatOutput (JSON), contradicting the raw-output contract. The
	// raw-output block below sends the whole body and streams the
	// response bytes verbatim instead.
	if (batchSize !== undefined && !isRawOutput) {
		// Batch mode: when bodyData is an array longer than batchSize,
		// split into chunks and send sequentially.
		lines.push(
			`        if (Array.isArray(bodyData) && bodyData.length > ${batchSize}) {`
		);
		lines.push(
			`          const total = Math.ceil(bodyData.length / ${batchSize});`
		);
		lines.push(`          let result: unknown = null;`);
		lines.push(
			`          for (let i = 0; i < bodyData.length; i += ${batchSize}) {`
		);
		lines.push(
			`            const batch = bodyData.slice(i, i + ${batchSize});`
		);
		lines.push(
			`            const batchNum = Math.floor(i / ${batchSize}) + 1;`
		);
		const batchOpts = headerOptExpr
			? `{ body: batch, headers: ${headerOptExpr} }`
			: "{ body: batch }";
		const escapedBatchLabel = escapeForTemplateLiteral(progressLabel);
		lines.push(
			`            result = await withProgress(\`${escapedBatchLabel}: batch \${batchNum}/\${total}\`, async () => (requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, ${bodyBypassUrlExpr}, ${batchOpts})));`
		);
		lines.push(`          }`);
		lines.push(formatOutputCall("          "));
		lines.push(`          return;`);
		lines.push(`        }`);
	}

	if (isRawOutput) {
		// Binary / text response with an explicit --body payload: forward
		// the body verbatim, stream the response to stdout.
		const rawBodyParts: string[] = [];
		if (acceptsJson) {
			rawBodyParts.push("body: JSON.stringify(bodyData)");
			rawBodyParts.push("contentType: 'application/json'");
		} else {
			rawBodyParts.push("body: bodyData");
			rawBodyParts.push(`contentType: '${rawContentType}'`);
		}
		if (hasHeaders) rawBodyParts.push(`headers: ${HEADERS_GUARDED_EXPR}`);
		for (const l of emitRawTail("        ", bodyBypassUrlExpr, rawBodyParts)) {
			lines.push(l);
		}
	} else if (
		acceptsJson &&
		batchSize === undefined &&
		canEmitTypedJsonBodySdkCall(ctx)
	) {
		lines.push(
			`        const result = ${wrapAwait(typedParsedBodySdkCall(ctx))};`
		);
		lines.push(formatOutputCall("        "));
		lines.push(`        return;`);
	} else {
		const bodyBypassOpts = headerOptExpr
			? `{ body: bodyData, headers: ${headerOptExpr} }`
			: "{ body: bodyData }";
		lines.push(
			`        const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, ${bodyBypassUrlExpr}, ${bodyBypassOpts})`)};`
		);
		lines.push(formatOutputCall("        "));
		lines.push(`        return;`);
	}

	lines.push(`      }`);
	return lines;
}
