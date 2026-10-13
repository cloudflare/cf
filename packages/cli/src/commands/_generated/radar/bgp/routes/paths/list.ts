import operation from "../../../../_operations/radar/bgp/routes/paths/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 radar bgp routes paths list\n\nRetrieves the paths an AS uses to reach the tier-1 clique, derived from RouteViews RIB snapshots. Each entry is an ordered AS-path segment (from the queried AS toward a tier-1) with the number of observed paths and peers, and the collectors that observed it. By default segments are merged across all active collectors; pass "collector" to scope to one. The response also includes an "asnInfo" map (keyed by ASN) with the name and country for every ASN in the returned segments plus the queried ASN (best-effort; null when unavailable).'
		)
		.option("asn", {
			type: "string",
			description: "Single Autonomous System Number (ASN) as integer.",
			demandOption: true,
		})
		.option("ip-version", {
			type: "string",
			description: "Address family of the observed paths. Defaults to IPv4.",
			choices: ["IPv4", "IPv6"],
		})
		.option("collector", {
			type: "string",
			description:
				'Scope to a single RouteViews collector (e.g. "route-views3"). Omit to merge across all active collectors (identical path segments are deduplicated, observation counts summed, and every contributing collector listed).',
		})
		.option("format", {
			type: "string",
			description: "Format in which results will be returned.",
			choices: ["JSON", "CSV"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Get tier-1 path segments for an AS",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp routes paths list",
				classification: {
					safeFlags: ["ip-version", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
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
};

export default command;
