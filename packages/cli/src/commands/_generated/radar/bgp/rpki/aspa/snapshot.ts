import operation from "../../../../_operations/radar/bgp/rpki/aspa/snapshot.js";
/**
 * snapshot command
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
	command: "snapshot",
	describe: "Get ASPA objects snapshot",
	usage:
		"$0 radar bgp rpki aspa snapshot\n\nRetrieves current or historical ASPA (Autonomous System Provider Authorization) objects. ASPA objects define which ASNs are authorized upstream providers for a customer ASN.",
	flags: {
		"customer-asn": {
			kind: "parsed",
			brief: "Filter by customer ASN (the ASN publishing the ASPA object).",
			optional: true,
			parse: Number,
		},
		"provider-asn": {
			kind: "parsed",
			brief:
				"Filter by provider ASN (an authorized upstream provider in ASPA objects).",
			optional: true,
			parse: Number,
		},
		date: {
			kind: "parsed",
			brief: "Filters results by the specified datetime (ISO 8601).",
			optional: true,
			parse: String,
		},
		"include-asn-info": {
			kind: "boolean",
			brief: "Include ASN metadata (name, country) in response.",
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
				command: "radar bgp rpki aspa snapshot",
				classification: {
					safeFlags: ["include-asn-info", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					customerAsn: argv["customer-asn"],
					providerAsn: argv["provider-asn"],
					date: argv["date"],
					includeAsnInfo: argv["include-asn-info"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp rpki aspa snapshot",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/rpki/aspa/snapshot`,
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
