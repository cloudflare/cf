import operation from "../../_operations/radar/tlds/list.js";
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
	describe: "List TLDs",
	usage: "$0 radar tlds list\n\nRetrieves a list of TLDs.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		"tld-manager": {
			kind: "parsed",
			brief: "Filters results by TLD manager.",
			optional: true,
			parse: String,
		},
		"tld-type": {
			kind: "enum",
			brief:
				"Filters results by TLD type. GENERIC_RESTRICTED and SPONSORED are deprecated and return no results, as IANA consolidated them into GENERIC. INFRASTRUCTURE is deprecated, as IANA reclassified .arpa as SPECIAL_USE.",
			values: [
				"GENERIC",
				"COUNTRY_CODE",
				"SPECIAL_USE",
				"GENERIC_RESTRICTED",
				"INFRASTRUCTURE",
				"SPONSORED",
			],
			optional: true,
		},
		tld: {
			kind: "parsed",
			brief:
				"Filters results by top-level domain. Specify a comma-separated list of TLDs.",
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
				command: "radar tlds list",
				classification: {
					safeFlags: ["tld-type", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					offset: argv["offset"],
					tldManager: argv["tld-manager"],
					tldType: argv["tld-type"],
					tld: argv["tld"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar tlds list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/tlds`,
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
