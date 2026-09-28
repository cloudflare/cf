import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * trend command
 * @generated from apis/overlays/speed.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 speed pages trend <url>\n\nLists the core web vital metrics trend over time for a specific page."
		)
		.positional("url", {
			type: "string",
			description: "A URL.",
			demandOption: true,
		})
		.option("region", {
			type: "string",
			description: "A test region.",
			choices: [
				"asia-east1",
				"asia-northeast1",
				"asia-northeast2",
				"asia-south1",
				"asia-southeast1",
				"australia-southeast1",
				"europe-north1",
				"europe-southwest1",
				"europe-west1",
				"europe-west2",
				"europe-west3",
				"europe-west4",
				"europe-west8",
				"europe-west9",
				"me-west1",
				"southamerica-east1",
				"us-central1",
				"us-east1",
				"us-east4",
				"us-south1",
				"us-west1",
			],
			demandOption: true,
		})
		.option("device-type", {
			type: "string",
			description: "The type of device.",
			choices: ["DESKTOP", "MOBILE"],
			demandOption: true,
		})
		.option("start", {
			type: "string",
			description: "Start",
			demandOption: true,
		})
		.option("end", { type: "string", description: "End" })
		.option("tz", {
			type: "string",
			description: "The timezone of the start and end timestamps.",
			demandOption: true,
		})
		.option("metrics", {
			type: "string",
			description:
				"A comma-separated list of metrics to include in the results.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"speed-list-page-trend">;
type Query = SdkQuery<"speed-list-page-trend">;

const typedBuilder = withArgTypes<
	{
		region: Query["region"];
		"device-type": Query["deviceType"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "trend <url>",
	describe: "List core web vital metrics trend",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "speed pages trend",
				classification: {
					safeFlags: ["region", "device-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					region: argv["region"],
					deviceType: argv["device-type"],
					start: argv["start"],
					end: argv["end"],
					tz: argv["tz"],
					metrics: argv["metrics"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf speed pages trend",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/speed_api/pages/${argv["url"] == null ? "<url>" : encodeURIComponent(String(argv["url"]))}/trend`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							url: String(argv["url"] ?? ""),
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
					client.speed.pages.trend({
						zone_id: zoneId,
						url: argv["url"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
