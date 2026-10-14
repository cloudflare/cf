import operation from "../../../_operations/radar/traffic-anomalies/locations/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar traffic-anomalies locations get\n\nRetrieves the sum of Internet traffic anomalies, grouped by location. These anomalies are signals that might indicate an outage, automatically detected by Radar and manually verified by our team."
		)
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("date-range", {
			type: "string",
			description:
				"Filters results by a relative date range ending at the current time. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`), e.g. `7d`. Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `3dcontrol` covers days -10 to -7, `7dcontrol` covers days -14 to -7, `28dcontrol` covers days -56 to -28, and `10dcontrol` covers days -24 to -14). Mutually exclusive with `dateStart`/`dateEnd`.",
		})
		.option("date-start", {
			type: "string",
			description:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
		})
		.option("date-end", {
			type: "string",
			description:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
		})
		.option("status", {
			type: "string",
			description: "Status",
			choices: ["VERIFIED", "UNVERIFIED"],
		})
		.option("format", {
			type: "string",
			description: "Format in which results will be returned.",
			choices: ["JSON", "CSV"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get top locations by total traffic anomalies",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar traffic-anomalies locations get",
				classification: {
					safeFlags: ["status", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					status: argv["status"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar traffic-anomalies locations get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/traffic_anomalies/locations`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
