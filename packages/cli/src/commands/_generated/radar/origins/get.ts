import operation from "../../_operations/radar/origins/get.js";
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
	command: "get <slug>",
	describe: "Get Origin details",
	usage:
		"$0 radar origins get <slug>\n\nRetrieves the requested origin information with its regions.",
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
	operands: [{ placeholder: "slug", brief: "Origin slug.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar origins get",
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
						command: "cf radar origins get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/origins/${argv["slug"] == null ? "<slug>" : encodeURIComponent(String(argv["slug"]))}`,
						pathParams: { slug: String(argv["slug"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { slug: argv["slug"], ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
