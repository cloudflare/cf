import operation from "../../_operations/radar/bots/list.js";
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
	describe: "List bots",
	usage: "$0 radar bots list\n\nRetrieves a list of bots.",
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
		"bot-category": {
			kind: "enum",
			brief:
				"Filters results by bot category. `ACCESSIBILITY`, `AGGREGATOR`, `AI_SEARCH`, `ARCHIVER`, `SOCIAL_MEDIA_MARKETING` and `WEBHOOKS` are deprecated legacy categories that match only that exact category.",
			values: [
				"ACADEMIC_RESEARCH",
				"ADVERTISING_AND_MARKETING",
				"AI_ASSISTANT",
				"AI_CRAWLER",
				"COMMERCE",
				"FEED_FETCHER",
				"MONITORING_AND_ANALYTICS",
				"OTHER",
				"PAGE_PREVIEW",
				"SEARCH_ENGINE_CRAWLER",
				"SEARCH_ENGINE_OPTIMIZATION",
				"SECURITY",
				"ACCESSIBILITY",
				"AGGREGATOR",
				"AI_SEARCH",
				"ARCHIVER",
				"SOCIAL_MEDIA_MARKETING",
				"WEBHOOKS",
			],
			optional: true,
		},
		"bot-operator": {
			kind: "parsed",
			brief: "Filters results by bot operator.",
			optional: true,
			parse: String,
		},
		kind: {
			kind: "enum",
			brief:
				"Filters results by bot kind. Deprecated: the Verified Bot / Signed Agent distinction is being removed.",
			values: ["AGENT", "BOT"],
			optional: true,
		},
		"bot-verification-status": {
			kind: "enum",
			brief: "Filters results by bot verification status.",
			values: ["VERIFIED"],
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
				command: "radar bots list",
				classification: {
					safeFlags: [
						"bot-category",
						"kind",
						"bot-verification-status",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					offset: argv["offset"],
					botCategory: argv["bot-category"],
					botOperator: argv["bot-operator"],
					kind: argv["kind"],
					botVerificationStatus: argv["bot-verification-status"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bots list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bots`,
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
