import operation from "../../../_operations/radar/ranking/domain/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar ranking domain get <domain>\n\nRetrieves domain rank details. Cloudflare provides an ordered rank for the top 100 domains, but for the remainder it only provides ranking buckets like top 200 thousand, top one million, etc.. These are available through Radar datasets endpoints."
		)
		.positional("domain", {
			type: "string",
			description: "Domain name.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("ranking-type", {
			type: "string",
			description: "The ranking type.",
			choices: ["POPULAR", "TRENDING_RISE", "TRENDING_STEADY"],
		})
		.option("name", {
			type: "string",
			description: "Array of names used to label the series in the response.",
		})
		.option("include-top-locations", {
			type: "boolean",
			description: "Includes top locations in the response.",
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

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <domain>",
	describe: "Get domain rank details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar ranking domain get",
				classification: {
					safeFlags: [
						"ranking-type",
						"include-top-locations",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					rankingType: argv["ranking-type"],
					name: argv["name"],
					includeTopLocations: argv["include-top-locations"],
					date: argv["date"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ranking domain get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ranking/domain/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}`,
						pathParams: { domain: String(argv["domain"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { domain: argv["domain"], ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
