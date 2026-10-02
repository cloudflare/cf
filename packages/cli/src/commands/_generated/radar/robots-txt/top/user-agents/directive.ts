import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * directive command
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
		.usage(
			"$0 radar robots-txt top user-agents directive\n\nRetrieves the top user agents on robots.txt files."
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
		.option("domain-category", {
			type: "string",
			description: "Filters results by domain category.",
		})
		.option("directive", {
			type: "string",
			description: "Filters results by robots.txt directive.",
			choices: ["ALLOW", "DISALLOW"],
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

type Query = SdkQuery<"radar-get-robots-txt-top-user-agents-by-directive">;

const typedBuilder = withArgTypes<
	{
		"user-agent-category": Query["userAgentCategory"];
		directive: Query["directive"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "directive",
	describe: "Get top user agents on robots.txt files",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar robots-txt top user-agents directive",
				classification: {
					safeFlags: ["user-agent-category", "directive", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.radar.robotsTxt.top.userAgents.directive(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
