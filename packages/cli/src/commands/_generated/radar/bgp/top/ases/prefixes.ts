import operation from "../../../../_operations/radar/bgp/top/ases/prefixes.js";
/**
 * prefixes command
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
	command: "prefixes",
	describe: "Get top ASes by prefix count",
	usage:
		"$0 radar bgp top ases prefixes\n\nRetrieves the full list of autonomous systems on the global routing table ordered by announced prefixes count. The data comes from public BGP MRT data archives and updates every 2 hours.",
	flags: {
		country: {
			kind: "parsed",
			brief: "Alpha-2 country code.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of ASes to return.",
			optional: true,
			parse: Number,
		},
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp top ases prefixes",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					country: argv["country"],
					limit: argv["limit"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp top ases prefixes",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/top/ases/prefixes`,
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
