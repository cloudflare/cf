import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security schema-validation settings operations update <operation-id>\n\nFully updates schema validation settings for a specific API operation."
		)
		.positional("operation-id", {
			type: "string",
			description: "Identifier for the operation",
			demandOption: true,
		})
		.option("mitigation-action", {
			type: "string",
			description:
				'When set, this applies a mitigation action to this operation\n\n  - `"log"` - log request when request does not conform to schema for this operation\n  - `"block"` - deny access to the site when request does not conform to schema for this operation\n  - `"none"` - will skip mitigation for this operation\n  - `null` - clears any mitigation action\n',
			choices: ["log", "block", "none"],
		})
		.coerce("mitigation-action", (value: string | undefined) =>
			resolveFileToken(value, "mitigation-action", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"schema-validation-update-per-operation-setting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <operation-id>",
	describe: "Update per-operation schema validation setting",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation settings operations update",
				classification: {
					safeFlags: ["mitigation-action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command:
							"cf api-security schema-validation settings operations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/settings/operations/${argv["operation-id"] == null ? "<operation-id>" : encodeURIComponent(String(argv["operation-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"operation-id": String(argv["operation-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										mitigation_action: argv["mitigation-action"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.apiSecurity.schemaValidation.settings.operations.update({
							...bodyData,
							zone_id: zoneId,
							operation_id: argv["operation-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["mitigation-action"] === undefined) {
					argv["mitigation-action"] = await promptForRequiredEnumField(
						"mitigation-action",
						'When set, this applies a mitigation action to this operation    - \`"log"\` - log request when request does not conform to schema for this operation   - \`"block"\` - deny access to the site when request does not conform to schema for this operation   - \`"none"\` - will skip mitigation for this operation   - \`null\` - clears any mitigation action ',
						["log", "block", "none"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					mitigation_action: argv["mitigation-action"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.apiSecurity.schemaValidation.settings.operations.update({
						...bodyData,
						zone_id: zoneId,
						operation_id: argv["operation-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
