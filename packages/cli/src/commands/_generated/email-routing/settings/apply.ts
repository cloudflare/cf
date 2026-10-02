import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * apply command
 * @generated from apis/overlays/email-routing.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-routing settings apply\n\nApply the provided settings to your Email Routing zone. Omitted settings retain their current values, as with PATCH."
		)
		.option("enabled", {
			type: "boolean",
			description:
				"State of your zone Email Routing settings. No-op on this endpoint - use `POST`/`DELETE /zones/{zone_id}/email/routing/dns`.",
		})
		.option("skip-wizard", {
			type: "boolean",
			description:
				"Flag to check if the user skipped the configuration wizard.",
		})
		.option("support-subaddress", {
			type: "boolean",
			description:
				"Whether subaddressing (plus-addressing) is honored when matching incoming mail against routing rules.",
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

type Request =
	SdkRequest<"email-routing-settings-replace-email-routing-settings">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "apply",
	describe: "Apply Email Routing settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing settings apply",
				classification: {
					safeFlags: [
						"enabled",
						"skip-wizard",
						"support-subaddress",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-routing settings apply",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/routing`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										skip_wizard: argv["skip-wizard"],
										support_subaddress: argv["support-subaddress"],
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
						client.emailRouting.settings.apply({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enabled: argv["enabled"],
					skip_wizard: argv["skip-wizard"],
					support_subaddress: argv["support-subaddress"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailRouting.settings.apply({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
