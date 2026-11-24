import operation from "../../_operations/radar/agent-readiness/summary.js";
/**
 * summary command
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
	command: "summary <dimension>",
	describe: "Get agent readiness summary",
	usage:
		"$0 radar agent-readiness summary <dimension>\n\nReturns a summary of AI agent readiness scores across scanned domains, grouped by the specified dimension. Data is sourced from weekly bulk scans. All values are raw domain counts.",
	flags: {
		date: {
			kind: "parsed",
			brief: "Filters results by the specified date.",
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
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
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
	operands: [
		{
			placeholder: "dimension",
			brief:
				"Specifies the agent readiness data dimension by which to group the results.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar agent-readiness summary",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					date: argv["date"],
					domainCategory: argv["domain-category"],
					name: argv["name"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar agent-readiness summary",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/agent_readiness/summary/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						dimension: argv["dimension"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
