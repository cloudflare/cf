import operation from "../../../_operations/radar/entities/asns/get.js";
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
	command: "get <asn>",
	describe: "Get AS details by ASN",
	usage:
		"$0 radar entities asns get <asn>\n\nRetrieves the requested autonomous system information. (A confidence level below `5` indicates a low level of confidence in the traffic data - normally this happens because Cloudflare has a small amount of traffic from/to this AS). Population estimates come from APNIC (refer to https://labs.apnic.net/?p=526).",
	flags: {
		"include-confidence-level": {
			kind: "boolean",
			brief:
				"Include the traffic data confidence level in the response. Set to `false` to skip it and get a faster response.",
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
	operands: [
		{
			placeholder: "asn",
			brief: "Single Autonomous System Number (ASN) as integer.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar entities asns get",
				classification: {
					safeFlags: ["include-confidence-level", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					includeConfidenceLevel: argv["include-confidence-level"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar entities asns get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/entities/asns/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}`,
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
