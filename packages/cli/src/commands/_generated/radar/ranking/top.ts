import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * top command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar ranking top\n\nRetrieves the top or trending domains based on their rank. Popular domains are domains of broad appeal based on how people use the Internet. Trending domains are domains that are generating a surge in interest. For more information on top domains, see https://blog.cloudflare.com/radar-domain-rankings/."
		)
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("name", {
			type: "string",
			description: "Array of names used to label the series in the response.",
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
		})
		.option("domain-category", {
			type: "string",
			description: "Filters results by domain category.",
		})
		.option("date", {
			type: "string",
			description: "Filters results by the specified array of dates.",
		})
		.option("ranking-type", {
			type: "string",
			description: "The ranking type.",
			choices: ["POPULAR", "TRENDING_RISE", "TRENDING_STEADY"],
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

type Query = SdkQuery<"radar-get-ranking-top-domains">;

const typedBuilder = withArgTypes<
	{
		"ranking-type": Query["rankingType"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "top",
	describe: "Get top or trending domains",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar ranking top",
				classification: {
					safeFlags: ["ranking-type", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					name: argv["name"],
					location: argv["location"],
					domainCategory: argv["domain-category"],
					date: argv["date"],
					rankingType: argv["ranking-type"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ranking top",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ranking/top`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.ranking.top(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
