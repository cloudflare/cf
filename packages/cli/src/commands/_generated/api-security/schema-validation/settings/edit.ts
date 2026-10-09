import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security schema-validation settings edit\n\nPartially updates global schema validation settings for a zone using PATCH semantics."
		)
		.option("validation-default-mitigation-action", {
			type: "string",
			description:
				'The default mitigation action used\nMitigation actions are as follows:\n\n  - `"log"` - log request when request does not conform to schema\n  - `"block"` - deny access to the site when request does not conform to schema\n  - `"none"` - skip running schema validation\n',
			choices: ["none", "log", "block"],
		})
		.coerce(
			"validation-default-mitigation-action",
			(value: string | undefined) =>
				resolveFileToken(value, "validation-default-mitigation-action", "text")
		)
		.option("validation-override-mitigation-action", {
			type: "string",
			description:
				'When set, this overrides both zone level and operation level mitigation actions.\n\n  - `"none"` - skip running schema validation entirely for the request\n  - `null` - clears any existing override\n',
			choices: ["none"],
		})
		.coerce(
			"validation-override-mitigation-action",
			(value: string | undefined) =>
				resolveFileToken(value, "validation-override-mitigation-action", "text")
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

type Request = SdkRequest<"schema-validation-edit-settings">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Edit global schema validation settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation settings edit",
				classification: {
					safeFlags: [
						"validation-default-mitigation-action",
						"validation-override-mitigation-action",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security schema-validation settings edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										validation_default_mitigation_action:
											argv["validation-default-mitigation-action"],
										validation_override_mitigation_action:
											argv["validation-override-mitigation-action"],
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.apiSecurity.schemaValidation.settings.edit({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					validation_default_mitigation_action:
						argv["validation-default-mitigation-action"],
					validation_override_mitigation_action:
						argv["validation-override-mitigation-action"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.apiSecurity.schemaValidation.settings.edit({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
