import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get-complaints command
 * @generated from apis/overlays/email-sending.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-sending subdomains reputation get-complaints <subdomain-id>\n\nReturns the matched complaint count for a sending subdomain in a half-open time window of up to seven days."
		)
		.positional("subdomain-id", {
			type: "string",
			description: "Sending subdomain identifier.",
			demandOption: true,
		})
		.option("start-at", {
			type: "string",
			description: "Start at",
			demandOption: true,
		})
		.option("end-at", {
			type: "string",
			description: "End at",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"email-sending-subdomains-get-sending-subdomain-reputation-complaints">;
type Query =
	SdkQuery<"email-sending-subdomains-get-sending-subdomain-reputation-complaints">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-complaints <subdomain-id>",
	describe: "Get sending subdomain complaint count",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending subdomains reputation get-complaints",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					start_at: argv["start-at"],
					end_at: argv["end-at"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-sending subdomains reputation get-complaints",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/sending/subdomains/${argv["subdomain-id"] == null ? "<subdomain-id>" : encodeURIComponent(String(argv["subdomain-id"]))}/reputation/complaints`,
						pathParams: {
							"subdomain-id": String(argv["subdomain-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.emailSending.subdomains.reputation.getComplaints({
						zone_id: zoneId,
						subdomain_id: argv["subdomain-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
