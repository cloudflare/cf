import operation from "../../../_operations/radar/bgp/routes/moas.js";
/**
 * moas command
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
	command: "moas",
	describe: "Get Multi-Origin AS (MOAS) prefixes",
	usage:
		"$0 radar bgp routes moas\n\nRetrieves all Multi-Origin AS (MOAS) prefixes in the global routing tables.",
	flags: {
		origin: {
			kind: "parsed",
			brief: "Lookup MOASes originated by the given ASN.",
			optional: true,
			parse: Number,
		},
		prefix: { kind: "parsed", brief: "Prefix", optional: true, parse: String },
		"invalid-only": {
			kind: "boolean",
			brief: "Lookup only RPKI invalid MOASes.",
			optional: true,
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
				command: "radar bgp routes moas",
				classification: {
					safeFlags: ["invalid-only", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					origin: argv["origin"],
					prefix: argv["prefix"],
					invalid_only: argv["invalid-only"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes moas",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/moas`,
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
