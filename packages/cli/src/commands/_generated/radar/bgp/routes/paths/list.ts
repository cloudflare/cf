import operation from "../../../../_operations/radar/bgp/routes/paths/list.js";
/**
 * list command
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
	command: "list",
	describe: "Get tier-1 path segments for an AS",
	usage:
		'$0 radar bgp routes paths list\n\nRetrieves the paths an AS uses to reach the tier-1 clique, derived from RouteViews RIB snapshots. Each entry is an ordered AS-path segment (from the queried AS toward a tier-1) with the number of observed paths and peers, and the collectors that observed it. By default segments are merged across all active collectors; pass "collector" to scope to one. The response also includes an "asnInfo" map (keyed by ASN) with the name and country for every ASN in the returned segments plus the queried ASN (best-effort; null when unavailable).',
	flags: {
		asn: {
			kind: "parsed",
			brief: "Single Autonomous System Number (ASN) as integer.",
			parse: String,
		},
		"ip-version": {
			kind: "enum",
			brief: "Address family of the observed paths. Defaults to IPv4.",
			values: ["IPv4", "IPv6"],
			optional: true,
		},
		collector: {
			kind: "parsed",
			brief:
				'Scope to a single RouteViews collector (e.g. "route-views3"). Omit to merge across all active collectors (identical path segments are deduplicated, observation counts summed, and every contributing collector listed).',
			optional: true,
			parse: String,
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
				command: "radar bgp routes paths list",
				classification: {
					safeFlags: ["ip-version", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					ipVersion: argv["ip-version"],
					collector: argv["collector"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes paths list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/paths/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}`,
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
