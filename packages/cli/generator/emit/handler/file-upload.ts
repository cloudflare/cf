/**
 * Emit the non-JSON `--file` bypass block.
 *
 * Triggers when the endpoint accepts a non-JSON content type
 * (multipart, octet-stream, javascript, etc.) and the user passes
 * `--file <path>`. Suppressed when the multipart block above already
 * covers the `--file` path (i.e. multipart is the only non-JSON
 * content type AND the upstream block enters when `--file` is set).
 *
 * Two sub-shapes:
 *   - multipart/form-data: build a `FormData` with `--file` as the
 *     payload field.
 *   - everything else: send raw file bytes with the right
 *     Content-Type header.
 */
import {
	HEADERS_GUARDED_EXPR,
	renderOpts,
} from "../../codegen/opts-builder.js";
import type { EmitContext } from "../context.js";

export function emitFileUpload(ctx: EmitContext): string[] {
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
	const { hasFileUpload, multipartInfo } = derived;

	if (!hasFileUpload) return [];

	// Suppress when the multipart block above already covers the --file
	// path (multipart is the only non-JSON content type AND the block
	// fires when --file is set).
	const multipartOnlyCovered =
		multipartInfo !== undefined &&
		!opInfo.requestContentTypes?.includes("application/octet-stream");
	if (multipartOnlyCovered) return [];

	const lines: string[] = [];
	lines.push(``);
	lines.push(`      if (argv.file) {`);
	lines.push(`        const fileContent = readFileForFlag(argv.file);`);

	const primaryContentType =
		opInfo.requestContentTypes.find((ct) => ct !== "application/json") ??
		"application/octet-stream";

	if (primaryContentType === "multipart/form-data") {
		// This path only runs for multipart endpoints with NO additional
		// flags (fall-through from the multipart block when
		// multipartFlagFields is empty). Treat --file as the payload field.
		const fieldName = multipartInfo?.payloadField ?? "file";
		lines.push(`        const formData = new FormData();`);
		lines.push(
			`        formData.append('${fieldName}', new Blob([fileContent]), argv.file.split(/[\\\\/]/).filter(Boolean).pop());`
		);
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
			const fileUploadOpts = renderOpts([
				{ key: "body", expr: "formData" },
				{ key: "headers", expr: HEADERS_GUARDED_EXPR, omit: !hasHeaders },
			]);
			lines.push(
				`        const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, \`${resolvedRequestPath}\`, ${fileUploadOpts})`)};`
			);
			lines.push(formatOutputCall("        "));
			lines.push(`        return;`);
		}
	} else {
		if (isRawOutput) {
			const rawParts = [
				"body: fileContent",
				`contentType: '${primaryContentType}'`,
			];
			if (hasHeaders) rawParts.push(`headers: ${HEADERS_GUARDED_EXPR}`);
			for (const l of emitRawTail(
				"        ",
				`\`${resolvedRequestPath}\``,
				rawParts
			)) {
				lines.push(l);
			}
		} else {
			const ctExpr = hasHeaders
				? `{ 'Content-Type': '${primaryContentType}', ...${HEADERS_GUARDED_EXPR} }`
				: `{ 'Content-Type': '${primaryContentType}' }`;
			const fileUploadOpts = renderOpts([
				{ key: "body", expr: "fileContent" },
				{ key: "headers", expr: ctExpr },
			]);
			lines.push(
				`        const result = ${wrapAwait(`requestApi<unknown>(client, ${JSON.stringify(opInfo.method.toUpperCase())}, \`${resolvedRequestPath}\`, ${fileUploadOpts})`)};`
			);
			lines.push(formatOutputCall("        "));
			lines.push(`        return;`);
		}
	}

	lines.push(`      }`);

	return lines;
}
