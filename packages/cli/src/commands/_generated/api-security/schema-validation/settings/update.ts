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
			"$0 api-security schema-validation settings update\n\nFully updates global schema validation settings for a zone, replacing existing configuration."
		)
		.option("validation-default-mitigation-action", {
			type: "string",
			description:
				'The default mitigation action used\nMitigation actions are as follows:\n\n  - `"log"` - log request when request does not conform to schema\n  - `"block"` - deny access to the site when request does not conform to schema\n  - `"none"` - skip running schema validation\n',
			choices: ["none", "log", "block"],
		})
		.option("validation-override-mitigation-action", {
			type: "string",
			description:
				'When set, this overrides both zone level and operation level mitigation actions.\n\n  - `"none"` - skip running schema validation entirely for the request\n  - `null` - clears any existing override\n',
			choices: ["none"],
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

type Request = SdkRequest<"schema-validation-update-settings">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update global schema validation settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation settings update",
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
						command: "cf api-security schema-validation settings update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										validation_default_mitigation_action: resolveFileToken(
											argv["validation-default-mitigation-action"] as
												| string
												| undefined,
											"validation-default-mitigation-action",
											"text"
										),
										validation_override_mitigation_action: resolveFileToken(
											argv["validation-override-mitigation-action"] as
												| string
												| undefined,
											"validation-override-mitigation-action",
											"text"
										),
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
						client.apiSecurity.schemaValidation.settings.update({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["validation-default-mitigation-action"] === undefined) {
					argv["validation-default-mitigation-action"] =
						await promptForRequiredEnumField(
							"validation-default-mitigation-action",
							'The default mitigation action used Mitigation actions are as follows:    - \`"log"\` - log request when request does not conform to schema   - \`"block"\` - deny access to the site when request does not conform to schema   - \`"none"\` - skip running schema validation ',
							["none", "log", "block"] as const
						);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					validation_default_mitigation_action: resolveFileToken(
						argv["validation-default-mitigation-action"] as string | undefined,
						"validation-default-mitigation-action",
						"text"
					),
					validation_override_mitigation_action: resolveFileToken(
						argv["validation-override-mitigation-action"] as string | undefined,
						"validation-override-mitigation-action",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.apiSecurity.schemaValidation.settings.update({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
