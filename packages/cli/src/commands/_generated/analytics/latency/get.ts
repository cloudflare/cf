import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/analytics.ts
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
			"$0 analytics latency get\n\nRetrieves aggregate Argo Smart Routing analytics for a zone, including latency improvements, bandwidth savings, and routing statistics."
		)
		.option("bins", { type: "string", description: "Bins" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"argo-analytics-for-zone-argo-analytics-for-a-zone">;
type Query = SdkQuery<"argo-analytics-for-zone-argo-analytics-for-a-zone">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Argo Analytics for a zone",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics latency get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					bins: argv["bins"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf analytics latency get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/analytics/latency`,
						pathParams: {
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
					client.analytics.latency.get({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
