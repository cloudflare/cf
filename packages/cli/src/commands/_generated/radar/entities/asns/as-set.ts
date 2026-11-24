import operation from "../../../_operations/radar/entities/asns/as-set.js";
/**
 * as-set command
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
	command: "as-set <asn>",
	describe: "Get IRR AS-SETs that an AS is a member of",
	usage:
		"$0 radar entities asns as-set <asn>\n\nRetrieves Internet Routing Registry AS-SETs that an AS is a member of.",
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
		{
			placeholder: "asn",
			brief: "Retrieves all AS-SETs that the given AS is a member of.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar entities asns as-set",
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
						command: "cf radar entities asns as-set",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/entities/asns/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}/as_set`,
						pathParams: { asn: String(argv["asn"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { asn: argv["asn"], ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
