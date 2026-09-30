import assert from "node:assert";
import { resolveOperation } from "@cloudflare/forge";
import { getLeafUsage, getMethodSummary } from "./descriptions.js";
import { buildEmitContext } from "./emit/build-context.js";
import { generateBuilderLines } from "./emit/builder.js";
import { buildImportSet } from "./emit/handler/imports.js";
import { emitHandler } from "./emit/handler/index.js";
import {
	typedBuilderDeclaration,
	typedSdkTypeAliases,
} from "./emit/sdk-path.js";
import { generateCommandMeta, type GeneratedCommandMeta } from "./metadata";
import { sensitiveBodyPaths } from "./sensitive-body.js";
import { getTelemetrySafeFlags } from "./telemetry.js";
import { escapeForSingleQuote } from "./util.js";
import type { Schema } from "@cloudflare/forge";

/** Result of generating a command file. */
export interface GeneratedCommand {
	code: string;
	meta: GeneratedCommandMeta;
}

/**
 * Generate a single per-command module (the file that lives at
 * `_generated/<resource>/<group?>/<method>.ts`).
 *
 * @param method The method to generate.
 * @param resourceName The top-level resource (e.g. `dns`, `workers`).
 * @param groupName Optional method-group path (slash-separated for
 *   nested groups, e.g. `records` or `applications/cas`).
 * @param hideCommand When true, the command registers but is suppressed
 *   from `--help` output.
 */
export function generateCommandFile(
	method: Schema.method,
	resourceName: string,
	groupName?: string,
	hideCommand?: boolean
): GeneratedCommand {
	assert(method.operationId, `Operation ID missing for ${method.name}`);
	const opInfo = resolveOperation(method.operationId);
	assert(opInfo, `Operation ID missing for ${method.name}`);

	const { ctx, commandStr } = buildEmitContext({
		method,
		resourceName,
		groupName,
		opInfo,
	});

	const handlerLines = emitHandler(ctx);
	const imports = buildImportSet(ctx);
	const builderLines = generateBuilderLines(
		method,
		resourceName,
		opInfo,
		ctx.outputKind,
		ctx.derived
	);

	const usage = getLeafUsage(method, resourceName, groupName, commandStr);
	const builderBody = `return yargs
      .usage(${JSON.stringify(usage)})
${builderLines.join("\n")};`;
	const sdkTypeAliases = typedSdkTypeAliases(ctx);
	const sdkTypes =
		sdkTypeAliases.length > 0 ? `\n${sdkTypeAliases.join("\n")}\n` : "";
	const typedBuilder = typedBuilderDeclaration(ctx);
	const declarations = typedBuilder
		? `${sdkTypes}\n${typedBuilder}\n\ntype Args = InferArgs<typeof typedBuilder>;`
		: `type Args = InferArgs<typeof builder>;\n${sdkTypes}`;
	const builderProperty = typedBuilder ? "builder: typedBuilder," : "builder,";
	const telemetryCommandPath = groupName
		? `${resourceName} ${groupName.replaceAll("/", " ")} ${method.name}`
		: `${resourceName} ${method.name}`;
	const hasForceFlag = ctx.derived.args.some((arg) => arg.name === "force");
	const hasGeneratedForceFlag =
		(opInfo.method === "delete" || method.requireConfirmation) && !hasForceFlag;
	const telemetrySafeFlags = getTelemetrySafeFlags(ctx.derived.args, {
		includeGeneratedForce: hasGeneratedForceFlag,
		// Binary-response commands add a generator-owned boolean `--text` flag
		// that selects UTF-8 output. Limit this exception to that output kind:
		// schema-defined string fields also named `text` may contain secrets.
		includeGeneratedText: ctx.outputKind === "binary",
		includeShowSecrets: sensitiveBodyPaths(opInfo).length > 0,
	});
	const telemetrySafeFlagsLiteral = `[${telemetrySafeFlags
		.map((flag) => `'${escapeForSingleQuote(flag)}'`)
		.join(", ")}]`;
	const telemetryShortFlagAliases = hasGeneratedForceFlag
		? `, shortFlagAliases: { f: { canonical: 'force', type: 'boolean' } }`
		: "";

	const code = `/**
 * ${method.name} command
 * @generated from apis/overlays/${resourceName}.ts
 */
${imports.render().join("\n")}

function builder(yargs: Argv<CommonYargsOptions>) {
  ${builderBody}
}

${declarations}
const command: CommandModule<CommonYargsOptions, Args> = {
  command: '${commandStr}',
  describe: '${escapeForSingleQuote(getMethodSummary(method))}',
  ${builderProperty}
  handler: async (argv): Promise<void> =>
    runWithTelemetry(
      {
        command: '${escapeForSingleQuote(telemetryCommandPath)}',
        classification: { safeFlags: ${telemetrySafeFlagsLiteral}${telemetryShortFlagAliases} } satisfies ArgClassification<Args>,
      },
      argv as Record<string, unknown>,
      async () => {
${handlerLines.join("\n")}
      },
    ),
};

export default command;
`;

	const meta = generateCommandMeta(
		method,
		resourceName,
		groupName,
		hideCommand
	);
	return { code, meta };
}

export {
	generateGroupIndexFile,
	generateResourceIndexFile,
} from "./emit/index-files.js";

// `isMethodGroup` is re-exported from forge for use by `./index.ts`.
export { isMethodGroup } from "@cloudflare/forge";
