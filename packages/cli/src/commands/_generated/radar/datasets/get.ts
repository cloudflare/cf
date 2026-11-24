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
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <alias>",
	describe: "Get dataset CSV stream",
	usage:
		"$0 radar datasets get <alias>\n\nRetrieves the CSV content of a given dataset by alias or ID. When getting the content by alias the latest dataset is returned, optionally filtered by the latest available at a given date.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "alias", brief: "Dataset alias or ID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar datasets get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar datasets get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/datasets/${argv["alias"] == null ? "<alias>" : encodeURIComponent(String(argv["alias"]))}`,
						pathParams: { alias: String(argv["alias"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(
						`/radar/datasets/${encodeURIComponent(String(argv["alias"]))}`,
						{
							method: "GET",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
						}
					)
				);
				writeRawOutput(__cfRawBytes.toString("utf-8"));
				return;
			}
		),
});

export default command;
