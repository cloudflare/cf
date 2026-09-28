import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * set-validation command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security schema-validation schemas set-validation <schema-id>\n\nEnables or disables validation for an uploaded OpenAPI schema without changing the schema document."
		)
		.positional("schema-id", {
			type: "string",
			description: "The unique identifier of the schema",
			demandOption: true,
		})
		.option("validation-enabled", {
			type: "boolean",
			description: "Flag whether schema is enabled for validation.",
		})
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

type Request = SdkRequest<"schema-validation-edit-schema">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "set-validation <schema-id>",
	describe: "Set schema validation state",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation schemas set-validation",
				classification: {
					safeFlags: ["validation-enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security schema-validation schemas set-validation",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/schemas/${argv["schema-id"] == null ? "<schema-id>" : encodeURIComponent(String(argv["schema-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"schema-id": String(argv["schema-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										validation_enabled: argv["validation-enabled"],
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
						client.apiSecurity.schemaValidation.schemas.setValidation({
							...bodyData,
							zone_id: zoneId,
							schema_id: argv["schema-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					validation_enabled: argv["validation-enabled"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.apiSecurity.schemaValidation.schemas.setValidation({
						...bodyData,
						zone_id: zoneId,
						schema_id: argv["schema-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
