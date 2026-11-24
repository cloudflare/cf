import operation from "../../_operations/speed/pages/trend.js";
/**
 * trend command
 * @generated from apis/overlays/speed.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "trend <url>",
	describe: "List core web vital metrics trend",
	usage:
		"$0 speed pages trend <url>\n\nLists the core web vital metrics trend over time for a specific page.",
	flags: {
		region: {
			kind: "enum",
			brief: "A test region.",
			values: [
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
		},
		"device-type": {
			kind: "enum",
			brief: "The type of device.",
			values: ["DESKTOP", "MOBILE"],
		},
		start: { kind: "parsed", brief: "Start", parse: String },
		end: { kind: "parsed", brief: "End", optional: true, parse: String },
		tz: {
			kind: "parsed",
			brief: "The timezone of the start and end timestamps.",
			parse: String,
		},
		metrics: {
			kind: "parsed",
			brief: "A comma-separated list of metrics to include in the results.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "url", brief: "A URL.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "speed pages trend",
				classification: {
					safeFlags: ["region", "device-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, {
						zone_id: zoneId,
						url: argv["url"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
