import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/csamScanner.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 csamScanner edit\n\nUpdate the CSAM Scanner configuration for a zone. Allows enabling or disabling CSAM scanning, updating the notification email, and configuring scanning sources. When a new email is provided, email verification is triggered automatically. The `enabled` field is a toggle; the server may adjust it based on whether the notification email is verified. Returns 403 if the zone or account is locked by Trust & Safety."
		)
		.option("id", {
			type: "string",
			description: "The feature identifier.",
			choices: ["csam_scanner"],
		})
		.option("value-email", {
			type: "string",
			description:
				"Notification email address for CSAM scan results. When changed,\nemail verification is triggered automatically.\n",
		})
		.option("value-enabled", {
			type: "boolean",
			description: "Whether CSAM scanning is enabled for this zone.",
		})
		.option("value-resend-email", {
			type: "boolean",
			description:
				"Set to true to trigger re-sending the email verification.\nWrite-only; never appears in responses (omitted when false).\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for updating CSAM Scanner configuration. ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"csam-scanner-update-setting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Update CSAM Scanner setting",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "csamScanner edit",
				classification: {
					safeFlags: ["id", "value-enabled", "value-resend-email", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf csamScanner edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/csam_scanner_third_party`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										value: {
											email: resolveFileToken(
												argv["value-email"] as string | undefined,
												"value-email",
												"text"
											),
											enabled: argv["value-enabled"],
											resend_email: argv["value-resend-email"],
										},
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
						client.csamScanner.edit({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					value: {
						email: resolveFileToken(
							argv["value-email"] as string | undefined,
							"value-email",
							"text"
						),
						enabled: argv["value-enabled"],
						resend_email: argv["value-resend-email"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.csamScanner.edit({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
