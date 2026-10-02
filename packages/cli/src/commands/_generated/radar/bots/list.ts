import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 radar bots list\n\nRetrieves a list of bots.")
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("offset", {
			type: "number",
			description:
				"Skips the specified number of objects before fetching the results.",
		})
		.option("bot-category", {
			type: "string",
			description: "Filters results by bot category.",
			choices: [
				"SEARCH_ENGINE_CRAWLER",
				"SEARCH_ENGINE_OPTIMIZATION",
				"MONITORING_AND_ANALYTICS",
				"ADVERTISING_AND_MARKETING",
				"SOCIAL_MEDIA_MARKETING",
				"PAGE_PREVIEW",
				"ACADEMIC_RESEARCH",
				"SECURITY",
				"ACCESSIBILITY",
				"WEBHOOKS",
				"FEED_FETCHER",
				"AI_CRAWLER",
				"AGGREGATOR",
				"AI_ASSISTANT",
				"AI_SEARCH",
				"ARCHIVER",
			],
		})
		.option("bot-operator", {
			type: "string",
			description: "Filters results by bot operator.",
		})
		.option("kind", {
			type: "string",
			description:
				"Filters results by bot kind. Deprecated: the Verified Bot / Signed Agent distinction is being removed.",
			choices: ["AGENT", "BOT"],
		})
		.option("bot-verification-status", {
			type: "string",
			description: "Filters results by bot verification status.",
			choices: ["VERIFIED"],
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

type Query = SdkQuery<"radar-get-bots">;

const typedBuilder = withArgTypes<
	{
		"bot-category": Query["botCategory"];
		kind: Query["kind"];
		"bot-verification-status": Query["botVerificationStatus"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List bots",
	builder: typedBuilder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.radar.bots.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
