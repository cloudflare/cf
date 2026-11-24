import operation from "../../../_operations/radar/bgp/routes/pfx2as.js";
/**
 * pfx2as command
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
	command: "pfx2as",
	describe: "Get prefix-to-ASN mapping",
	usage:
		"$0 radar bgp routes pfx2as\n\nRetrieves the prefix-to-ASN mapping from global routing tables.",
	flags: {
		prefix: { kind: "parsed", brief: "Prefix", optional: true, parse: String },
		origin: {
			kind: "parsed",
			brief: "Lookup prefixes originated by the given ASN.",
			optional: true,
			parse: Number,
		},
		"rpki-status": {
			kind: "enum",
			brief:
				"Return only results with matching rpki status: valid, invalid or unknown.",
			values: ["VALID", "INVALID", "UNKNOWN"],
			optional: true,
		},
		"longest-prefix-match": {
			kind: "boolean",
			brief:
				"Return only results with the longest prefix match for the given prefix. For example, specify a /32 prefix to lookup the origin ASN for an IPv4 address.",
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
				command: "radar bgp routes pfx2as",
				classification: {
					safeFlags: [
						"rpki-status",
						"longest-prefix-match",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					prefix: argv["prefix"],
					origin: argv["origin"],
					rpkiStatus: argv["rpki-status"],
					longestPrefixMatch: argv["longest-prefix-match"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes pfx2as",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/pfx2as`,
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
