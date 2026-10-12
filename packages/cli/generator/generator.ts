import assert from "node:assert";
import { resolveOperation } from "@cloudflare/forge";
import { getLeafUsage, getMethodSummary } from "./descriptions.js";
import { buildEmitContext } from "./emit/build-context.js";
import { generateBuilderLines } from "./emit/builder.js";
import { buildImportSet } from "./emit/handler/imports.js";
import { emitHandler } from "./emit/handler/index.js";
import { operationLiteral, operationWire, usesPathTag } from "./emit/wire.js";
import { generateCommandMeta, type GeneratedCommandMeta } from "./metadata.js";
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

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
  command: '${commandStr}',
  describe: '${escapeForSingleQuote(getMethodSummary(method))}',
  builder,
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

/**
 * Generate the module of a method's operation (the file that lives at
 * `_generated/_operations/<resource>/<group?>/<method>.ts`), whose default
 * export is the `Operation` its command, and hand-written ones, send with
 * `Client.send`. It imports only the runtime's `path` tag, when its path has
 * parameters, so any module can import it.
 */
export function generateOperationFile(method: Schema.method): string {
	assert(method.operationId, `Operation ID missing for ${method.name}`);
	const opInfo = resolveOperation(method.operationId);
	assert(opInfo, `Operation ID missing for ${method.name}`);
	const imports = usesPathTag(opInfo.path)
		? `import { path } from "#api";\n\n`
		: "";
	return `/** @generated from ${method.operationId} */
${imports}export default ${operationLiteral(opInfo, operationWire(opInfo))} as const;
`;
}

export {
	generateGroupIndexFile,
	generateResourceIndexFile,
} from "./emit/index-files.js";

// `isMethodGroup` is re-exported from forge for use by `./index.ts`.
export { isMethodGroup } from "@cloudflare/forge";
