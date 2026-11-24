import operation from "../../_operations/radar/search/global.js";
/**
 * global command
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
	command: "global",
	describe: "Search for locations, ASes, reports, and more",
	usage:
		"$0 radar search global\n\nSearches for locations, autonomous systems, reports, bots, bot operators, certificate logs, certificate authorities, industries and verticals. Location names can be localized by sending an `Accept-Language` HTTP header with a BCP 47 language tag (e.g., `Accept-Language: pt-PT`). The full quality-value chain is supported (e.g., `pt-PT,pt;q=0.9,en;q=0.8`). ASN, ADM1 and ADM2 results include an `entity` with details about the matched entity.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		"limit-per-group": {
			kind: "parsed",
			brief: "Limits the number of objects per search category.",
			optional: true,
			parse: Number,
		},
		query: {
			kind: "parsed",
			brief: "String used to perform the search operation.",
			parse: String,
		},
		include: {
			kind: "parsed",
			brief: "Search types included in results.",
			variadic: true,
			optional: true,
			choices: [
				"ADM1S",
				"ASNS",
				"BOTS",
				"BOT_OPERATORS",
				"CERTIFICATE_AUTHORITIES",
				"CERTIFICATE_LOGS",
				"ORIGINS",
				"ORIGIN_REGIONS",
				"INDUSTRIES",
				"LOCATIONS",
				"NOTEBOOKS",
				"TLDS",
				"VERTICALS",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		exclude: {
			kind: "parsed",
			brief: "Search types excluded from results.",
			variadic: true,
			optional: true,
			choices: [
				"ADM1S",
				"ASNS",
				"BOTS",
				"BOT_OPERATORS",
				"CERTIFICATE_AUTHORITIES",
				"CERTIFICATE_LOGS",
				"ORIGINS",
				"ORIGIN_REGIONS",
				"INDUSTRIES",
				"LOCATIONS",
				"NOTEBOOKS",
				"TLDS",
				"VERTICALS",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
				command: "radar search global",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					limitPerGroup: argv["limit-per-group"],
					query: argv["query"],
					include: argv["include"],
					exclude: argv["exclude"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar search global",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/search/global`,
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
