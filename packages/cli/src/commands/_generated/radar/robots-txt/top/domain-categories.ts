import operation from "../../../_operations/radar/robots-txt/top/domain-categories.js";
/**
 * domain-categories command
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
	command: "domain-categories",
	describe: "Get top domain categories by robots.txt files parsed",
	usage:
		"$0 radar robots-txt top domain-categories\n\nRetrieves the top domain categories by the number of robots.txt files parsed.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-agent-category": {
			kind: "enum",
			brief: "Filters results by user agent category.",
			values: ["AI"],
			optional: true,
		},
		date: {
			kind: "parsed",
			brief: "Filters results by the specified array of dates.",
			variadic: true,
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
				command: "radar robots-txt top domain-categories",
				classification: {
					safeFlags: ["user-agent-category", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					name: argv["name"],
					userAgentCategory: argv["user-agent-category"],
					date: argv["date"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar robots-txt top domain-categories",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/robots_txt/top/domain_categories`,
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
