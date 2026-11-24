import operation from "../../_operations/zones/transformations-allowed-origins/edit.js";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Change Image Transformations Allowed Origins setting",
	usage:
		"$0 zones transformations-allowed-origins edit\n\nMedia Transformations Allowed Origins restricts transformations for images and video served through Cloudflare's network to requests originating from specified domains. Refer to the Image Transformations and Video Transformations documentation for more information.",
	flags: {
		value: {
			kind: "parsed",
			brief:
				'Comma-separated list of allowed origin domains for image and video transformations.\nUse "*" to allow all origins (default).\n',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones transformations-allowed-origins edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["value"] === undefined) {
						argv["value"] = await promptForRequiredField(
							"value",
							'Comma-separated list of allowed origin domains for image and video transformations. Use "*" to allow all origins (default). '
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf zones transformations-allowed-origins edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/transformations_allowed_origins`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
