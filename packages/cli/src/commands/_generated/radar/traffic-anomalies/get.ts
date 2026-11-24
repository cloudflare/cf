import operation from "../../_operations/radar/traffic-anomalies/get.js";
/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <uuid>",
	describe: "Get traffic anomaly by UUID",
	usage:
		"$0 radar traffic-anomalies get <uuid>\n\nRetrieves a single Internet traffic anomaly by UUID.",
	flags: {
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "uuid", brief: "Traffic anomaly UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar traffic-anomalies get",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar traffic-anomalies get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/traffic_anomalies/${argv["uuid"] == null ? "<uuid>" : encodeURIComponent(String(argv["uuid"]))}`,
						pathParams: { uuid: String(argv["uuid"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { uuid: argv["uuid"], ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
