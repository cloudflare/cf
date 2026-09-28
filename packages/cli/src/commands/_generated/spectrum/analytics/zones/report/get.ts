import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/spectrum.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 spectrum analytics zones report get\n\nRetrieves a list of total bandwidth by zone over a given time period."
		)
		.option("since", {
			type: "string",
			description:
				"Start of time interval to query, defaults to `until` - 6 hours. Timestamp must be in RFC3339 format and uses UTC unless otherwise specified.",
		})
		.option("until", {
			type: "string",
			description:
				"End of time interval to query, defaults to current time. Timestamp must be in RFC3339 format and uses UTC unless otherwise specified.",
		})
		.option("cdn-traffic", {
			type: "boolean",
			description: "Include CDN traffic in the bandwidth aggregation.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Query = SdkQuery<"spectrum-analytics-get-zones-report">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get zones bandwidth report",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "spectrum analytics zones report get",
				classification: {
					safeFlags: ["cdn-traffic", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					since: argv["since"],
					until: argv["until"],
					cdn_traffic: argv["cdn-traffic"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf spectrum analytics zones report get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/spectrum_analytics/zones/report`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.spectrum.analytics.zones.report.get(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
