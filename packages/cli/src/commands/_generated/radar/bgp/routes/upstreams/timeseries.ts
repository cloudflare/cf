import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * timeseries command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 radar bgp routes upstreams timeseries <asn>\n\nRetrieves the share of an AS’s observed paths carried by each direct upstream over time, derived from RouteViews RIB snapshots across all collectors (the combined product). Each upstream ASN is returned as its own series of shares (0–1); the least-significant upstreams beyond the requested limit are grouped into an "OTHER" series. Series share a common set of timestamps.'
		)
		.positional("asn", {
			type: "string",
			description: "Single Autonomous System Number (ASN) as integer.",
			demandOption: true,
		})
		.option("ip-version", {
			type: "string",
			description: "Address family of the observed paths. Defaults to IPv4.",
			choices: ["IPv4", "IPv6"],
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
		.option("limit", {
			type: "number",
			description:
				'Number of upstream ASNs to return as separate series, ranked by the first bucket. Remaining upstreams are grouped into an "OTHER" series. Defaults to 5.',
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

type Request = SdkRequest<"radar-get-bgp-routes-upstreams-timeseries">;
type Query = SdkQuery<"radar-get-bgp-routes-upstreams-timeseries">;

const typedBuilder = withArgTypes<
	{
		"ip-version": Query["ipVersion"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "timeseries <asn>",
	describe: "Get upstream composition time series for an AS",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp routes upstreams timeseries",
				classification: {
					safeFlags: ["ip-version", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					ipVersion: argv["ip-version"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					limit: argv["limit"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes upstreams timeseries",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/upstreams/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}/timeseries`,
						pathParams: { asn: String(argv["asn"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.bgp.routes.upstreams.timeseries({
						asn: argv["asn"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
