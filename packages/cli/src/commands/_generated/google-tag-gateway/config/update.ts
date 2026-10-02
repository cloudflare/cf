import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/google-tag-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 google-tag-gateway config update\n\nUpdates the Google Tag Gateway configuration for a zone."
		)
		.option("enabled", {
			type: "boolean",
			description: "Enables or disables Google Tag Gateway for this zone.",
		})
		.option("endpoint", {
			type: "string",
			description:
				"Specifies the endpoint path for proxying Google Tag Manager requests. Use an absolute path starting with '/', with no nested paths and alphanumeric characters only (e.g. /metrics).",
		})
		.option("hide-original-ip", {
			type: "boolean",
			description:
				"Hides the original client IP address from Google when enabled.",
		})
		.option("measurement-id", {
			type: "string",
			description:
				"Specify the Google Tag Manager container or measurement ID (e.g. GTM-XXXXXXX or G-XXXXXXXXXX).",
		})
		.option("set-up-tag", {
			type: "boolean",
			description:
				"Set up the associated Google Tag on the zone automatically when enabled.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Google Tag Gateway configuration for a zone.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"zone-settings-change-google-tag-gateway-config">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Google Tag Gateway configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "google-tag-gateway config update",
				classification: {
					safeFlags: ["enabled", "hide-original-ip", "set-up-tag", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf google-tag-gateway config update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/google-tag-gateway/config`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										hideOriginalIp: argv["hide-original-ip"],
										measurementId: resolveFileToken(
											argv["measurement-id"] as string | undefined,
											"measurement-id",
											"text"
										),
										setUpTag: argv["set-up-tag"],
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
						client.googleTagGateway.config.update({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["endpoint"] === undefined) {
					argv["endpoint"] = await promptForRequiredField(
						"endpoint",
						"Specifies the endpoint path for proxying Google Tag Manager requests. Use an absolute path starting with '/', with no nested paths and alphanumeric characters only (e.g. /metrics)."
					);
				}
				if (argv["hide-original-ip"] === undefined) {
					throw new Error(
						"--hide-original-ip is required (or pass --body with this field set)."
					);
				}
				if (argv["measurement-id"] === undefined) {
					argv["measurement-id"] = await promptForRequiredField(
						"measurement-id",
						"Specify the Google Tag Manager container or measurement ID (e.g. GTM-XXXXXXX or G-XXXXXXXXXX)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enabled: argv["enabled"],
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					hideOriginalIp: argv["hide-original-ip"],
					measurementId: resolveFileToken(
						argv["measurement-id"] as string | undefined,
						"measurement-id",
						"text"
					),
					setUpTag: argv["set-up-tag"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.googleTagGateway.config.update({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
