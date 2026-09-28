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
 * update-configuration command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pay-per-crawl pay-per-use zones update-configuration\n\nEnables or disables an existing pay-per-use zone configuration. Omitting enabled leaves the zone unchanged. Enabling a disabled zone requires completed publisher Stripe onboarding; an already-enabled zone is not affected by later Stripe status changes. Disabling starts a disabled period immediately while existing accepted licenses remain active until the start of the next UTC month; re-enabling before expiry clears the schedule and restores those licenses."
		)
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Pay-per-use zone configuration update",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"pay-per-crawl.patchPPUZoneConfiguration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update-configuration",
	describe: "Update pay-per-use zone configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-crawl pay-per-use zones update-configuration",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf pay-per-crawl pay-per-use zones update-configuration",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pay-per-use/configuration`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
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
						client.payPerCrawl.payPerUse.zones.updateConfiguration({
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.payPerCrawl.payPerUse.zones.updateConfiguration({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
