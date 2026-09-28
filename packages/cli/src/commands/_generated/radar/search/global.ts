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
 * global command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar search global\n\nSearches for locations, autonomous systems, reports, bots, certificate logs, certificate authorities, industries and verticals. Location names can be localized by sending an `Accept-Language` HTTP header with a BCP 47 language tag (e.g., `Accept-Language: pt-PT`). The full quality-value chain is supported (e.g., `pt-PT,pt;q=0.9,en;q=0.8`)."
		)
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("limit-per-group", {
			type: "number",
			description: "Limits the number of objects per search category.",
		})
		.option("query", {
			type: "string",
			description: "String used to perform the search operation.",
			demandOption: true,
		})
		.option("include", {
			type: "string",
			description: "Search types included in results.",
		})
		.option("exclude", {
			type: "string",
			description: "Search types excluded from results.",
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

type Query = SdkQuery<"radar-get-search-global">;

const typedBuilder = withArgTypes<
	{
		include: Query["include"];
		exclude: Query["exclude"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "global",
	describe: "Search for locations, ASes, reports, and more",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar search global",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.radar.search.global(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
