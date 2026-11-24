import operation from "../../../_operations/radar/entities/asns/rel.js";
/**
 * rel command
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
	command: "rel <asn>",
	describe: "Get AS-level relationships by ASN",
	usage:
		"$0 radar entities asns rel <asn>\n\nRetrieves AS-level relationship for given networks.",
	flags: {
		asn2: {
			kind: "parsed",
			brief:
				"Retrieves the AS relationship of ASN2 with respect to the given ASN.",
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
	operands: [
		{
			placeholder: "asn",
			brief:
				"Retrieves all ASNs with provider-customer or peering relationships with the given ASN.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar entities asns rel",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					asn2: argv["asn2"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar entities asns rel",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/entities/asns/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}/rel`,
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
