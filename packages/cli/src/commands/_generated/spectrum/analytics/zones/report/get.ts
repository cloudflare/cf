import operation from "../../../../_operations/spectrum/analytics/zones/report/get.js";
/**
 * get command
 * @generated from apis/overlays/spectrum.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get",
	describe: "Get zones bandwidth report",
	usage:
		"$0 spectrum analytics zones report get\n\nRetrieves a list of total bandwidth by zone over a given time period.",
	flags: {
		since: { kind: "parsed", brief: "Since", optional: true, parse: String },
		until: { kind: "parsed", brief: "Until", optional: true, parse: String },
		"cdn-traffic": {
			kind: "boolean",
			brief: "Include CDN traffic in the bandwidth aggregation.",
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
				command: "spectrum analytics zones report get",
				classification: {
					safeFlags: ["cdn-traffic", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
