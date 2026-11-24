import operation from "../../../../_operations/radar/robots-txt/top/user-agents/directive.js";
/**
 * directive command
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
	command: "directive",
	describe: "Get top user agents on robots.txt files",
	usage:
		"$0 radar robots-txt top user-agents directive\n\nRetrieves the top user agents on robots.txt files.",
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
		"domain-category": {
			kind: "parsed",
			brief: "Filters results by domain category.",
			variadic: true,
			optional: true,
			parse: String,
		},
		directive: {
			kind: "enum",
			brief: "Filters results by robots.txt directive.",
			values: ["ALLOW", "DISALLOW"],
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
				command: "radar robots-txt top user-agents directive",
				classification: {
					safeFlags: ["user-agent-category", "directive", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					name: argv["name"],
					userAgentCategory: argv["user-agent-category"],
					date: argv["date"],
					domainCategory: argv["domain-category"],
					directive: argv["directive"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar robots-txt top user-agents directive",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/robots_txt/top/user_agents/directive`,
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
