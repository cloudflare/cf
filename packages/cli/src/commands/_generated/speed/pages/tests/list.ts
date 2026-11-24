import operation from "../../../_operations/speed/pages/tests/list.js";
/**
 * list command
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
	command: "list",
	describe: "List page test history",
	usage:
		"$0 speed pages tests list\n\nTest history (list of tests) for a specific webpage.",
	flags: {
		url: { kind: "parsed", brief: "A URL.", parse: String },
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
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
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "speed pages tests list",
				classification: {
					safeFlags: ["region", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					region: argv["region"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf speed pages tests list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/speed_api/pages/${argv["url"] == null ? "<url>" : encodeURIComponent(String(argv["url"]))}/tests`,
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
