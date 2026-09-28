/**
 * Emit the `if (argv.dryRun) { … }` block.
 *
 * Runs BEFORE auth (so the user can dry-run without an API token /
 * resolvable account id). Prints a JSON envelope describing what
 * the live request would send: command, method, URL with
 * path-substituted, query params (when present), and body (for
 * mutating ops). Returns early after printing.
 *
 * `bodyKind` reflects how the body would actually be encoded — JSON,
 * multipart, octet-stream, or none — so callers can confirm the
 * encoding cf inferred from the OpenAPI spec.
 */
import { toKebabCase } from "@cloudflare/forge";
import { argvKey } from "../../codegen/identifiers.js";
import {
	bodyArgs,
	isPathArg,
	pathParamReadKey,
	positionalArgs,
} from "../../intermediate-representation.js";
import {
	ACCOUNT_PATH_PARAMS,
	accountOrZonePathParamLocal,
	substitutePathTemplate,
	ZONE_PATH_PARAMS,
} from "../../util.js";
import { emitBodyObject } from "./body-object.js";
import type { EmitContext } from "../context.js";

export function emitDryRun(ctx: EmitContext): string[] {
	const {
		method,
		opInfo,
		derived,
		allPathParamNames,
		needsAccountId,
		needsWorkerName,
		hasAccountOrZoneScope,
		hasParams,
		resourceName,
		groupName,
	} = ctx;
	const {
		multipartInfo,
		multipartFlagFields,
		hasBodyParams,
		hasBody,
		hasFileUpload,
		isMutating,
	} = derived;
	const positional = positionalArgs(derived.args);

	const lines: string[] = [];

	// Path template for dry-run display. Uses the resolved account-id
	// (env → cloudflare.config.ts settings) so the URL is
	// byte-identical to the live request. Other path params come from argv only;
	// dry-run runs before auth so we can't resolve them via SDK.
	//
	// Supplied path params are `encodeURIComponent`-encoded to match the
	// live request path (`build-context.ts`'s `resolvedRequestPath`), so
	// `--dry-run` previews the exact URL the live call would send. The
	// `<placeholder>` fallback (shown when the arg is absent) is left
	// un-encoded for readability — it never reaches the wire.
	const dryRunPathTemplate = substitutePathTemplate(opInfo.path, {
		needsWorkerName,
		args: derived.args,
		positional,
		firstPositionalIsZone: false,
		accountIdExpr: `\${__cfDryRunAccountId ?? '<account-id>'}`,
		scriptNameExpr: `\${argv["worker"] ?? '<worker>'}`,
		// Dry-run runs before auth, so `argv.zoneId` isn't resolved yet —
		// echo the user's `--zone` flag (then any pre-set `argv.zoneId`)
		// so the previewed URL reflects the zone they actually supplied.
		zoneExpr: `\${argv.zone ?? argv.zoneId ?? '<zone>'}`,
		paramExpr: (argName) =>
			`\${argv[${JSON.stringify(argName)}] == null ? '<${argName}>' : encodeURIComponent(String(argv[${JSON.stringify(argName)}]))}`,
	});

	// Path params entries (account-id is resolved separately into the URL),
	// keyed by the argv key each placeholder is read from. Zone aliases
	// echo the `--zone` flag for the same before-auth reason.
	const pathParamEntries = allPathParamNames
		.filter((name) => !ACCOUNT_PATH_PARAMS.has(name))
		.map((name) => {
			const key = pathParamReadKey(derived.args, name);
			const read = argvKey(key);
			const accountOrZoneLocal = accountOrZonePathParamLocal(opInfo.path, name);
			if (accountOrZoneLocal !== undefined) {
				return `${JSON.stringify(key)}: String(${accountOrZoneLocal})`;
			}
			if (ZONE_PATH_PARAMS.has(name)) {
				return `${JSON.stringify(key)}: String(argv.zone ?? ${read} ?? '')`;
			}
			return `${JSON.stringify(key)}: String(${read} ?? '')`;
		})
		.join(", ");

	// Body fields shown in the preview (mutating ops only): positional
	// non-path-param args, per-field body flags, --body / --file, and
	// multipart flags. Deduped so a field literally named "body" / "file"
	// doesn't collide with the --body / --file entries.
	const bodyKeys = isMutating
		? [
				...new Set([
					...positional.filter((a) => !isPathArg(a)).map((a) => a.name),
					...(hasBodyParams ? bodyArgs(derived.args).map((a) => a.name) : []),
					...(hasBody ? ["body"] : []),
					...(hasFileUpload ? ["file"] : []),
					...multipartFlagFields.map((f) => toKebabCase(f.name)),
				]),
			]
		: [];
	const bodyEntries = bodyKeys.map(
		(key) => `${JSON.stringify(key)}: ${argvKey(key)}`
	);
	const acceptsJson = opInfo.requestContentTypes.includes("application/json");
	const multipartOnly =
		multipartInfo !== undefined &&
		!opInfo.requestContentTypes.includes("application/octet-stream");
	const multipartFlagReads = multipartFlagFields.map((field) =>
		argvKey(toKebabCase(field.name))
	);
	const usesMultipart =
		multipartFlagReads.length > 0
			? multipartFlagReads.map((read) => `${read} !== undefined`).join(" || ")
			: "false";

	const command = [
		"cf",
		resourceName,
		groupName?.replace(/\//g, " "),
		method.name,
	]
		.filter(Boolean)
		.join(" ");

	// Pick the dry-run bodyKind so the printout reflects how the command
	// will actually encode the request.
	const dryRunBodyKind = !isMutating
		? "'none'"
		: multipartOnly
			? "'multipart'"
			: multipartInfo !== undefined && multipartFlagReads.length > 0
				? `${usesMultipart} ? 'multipart' : 'octet-stream'`
				: opInfo.requestContentTypes.length > 0 && !acceptsJson
					? "'octet-stream'"
					: bodyEntries.length > 0 || hasBody
						? "'json'"
						: "'none'";

	lines.push(`      if (argv.dryRun) {`);
	if (needsAccountId) {
		// Resolve account-id silently (env → settings) so the
		// printed URL is byte-identical to the live request.
		lines.push(
			hasAccountOrZoneScope
				? `        const __cfDryRunAccountId = argv.zone === undefined ? await resolveAccountIdSilent() : undefined;`
				: `        const __cfDryRunAccountId = await resolveAccountIdSilent();`
		);
	}
	if (hasAccountOrZoneScope) {
		lines.push(
			`        const accountOrZone = argv.zone === undefined ? "accounts" : "zones";`
		);
		lines.push(
			`        const accountOrZoneId = argv.zone ?? __cfDryRunAccountId ?? "<account-id>";`
		);
	}
	lines.push(`        formatDryRun({`);
	lines.push(`          command: '${command}',`);
	lines.push(`          method: '${opInfo.method.toUpperCase()}',`);
	lines.push(
		`          url: \`https://api.cloudflare.com/client/v4${dryRunPathTemplate}\`,`
	);
	lines.push(`          pathParams: { ${pathParamEntries} },`);
	// Query params: `queryParams` is a Record of every query flag; unset
	// ones are `undefined` and drop out of the JSON automatically.
	if (hasParams) {
		lines.push(`          query: queryParams,`);
	}
	lines.push(`          bodyKind: ${dryRunBodyKind},`);
	if (hasBody) {
		if (multipartOnly) {
			lines.push(`          body: { ${bodyEntries.join(", ")} },`);
		} else if (multipartInfo !== undefined && multipartFlagReads.length > 0) {
			lines.push(`          body: ${usesMultipart}`);
			lines.push(`            ? { ${bodyEntries.join(", ")} }`);
			lines.push(`            : argv.body,`);
		} else if (acceptsJson) {
			lines.push(`          body: argv.body !== undefined`);
			lines.push(`            ? parseBody(argv.body)`);
			if (hasBodyParams) {
				lines.push(`            : compactBody(`);
				for (const line of emitBodyObject(ctx, "\t\t\t\t")) {
					lines.push(`              ${line}`);
				}
				lines.push(`            ),`);
			} else {
				lines.push(`            : undefined,`);
			}
		} else {
			lines.push(`          body: argv.body,`);
		}
	} else if (bodyEntries.length > 0) {
		lines.push(`          body: { ${bodyEntries.join(", ")} },`);
	}
	lines.push(`        });`);
	lines.push(`        return;`);
	lines.push(`      }`);

	return lines;
}
