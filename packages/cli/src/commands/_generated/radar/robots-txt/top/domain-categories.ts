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
 * domain-categories command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar robots-txt top domain-categories\n\nRetrieves the top domain categories by the number of robots.txt files parsed."
		)
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("name", {
			type: "string",
			description: "Array of names used to label the series in the response.",
		})
		.option("user-agent-category", {
			type: "string",
			description: "Filters results by user agent category.",
			choices: ["AI"],
		})
		.option("date", {
			type: "string",
			description: "Filters results by the specified array of dates.",
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

type Query =
	SdkQuery<"radar-get-robots-txt-top-domain-categories-by-files-parsed">;

const typedBuilder = withArgTypes<
	{
		"user-agent-category": Query["userAgentCategory"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "domain-categories",
	describe: "Get top domain categories by robots.txt files parsed",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar robots-txt top domain-categories",
				classification: {
					safeFlags: ["user-agent-category", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.radar.robotsTxt.top.domainCategories(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
