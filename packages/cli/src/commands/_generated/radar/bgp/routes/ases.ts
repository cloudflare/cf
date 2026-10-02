import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * ases command
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
			"$0 radar bgp routes ases\n\nRetrieves all ASes in the current global routing tables with routing statistics."
		)
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify an alpha-2 location code.",
		})
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("sort-by", {
			type: "string",
			description: "Sorts results by the specified field.",
			choices: [
				"cone",
				"pfxs",
				"ipv4",
				"ipv6",
				"rpki_valid",
				"rpki_invalid",
				"rpki_unknown",
			],
		})
		.option("sort-order", {
			type: "string",
			description: "Sort order.",
			choices: ["ASC", "DESC"],
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

type Query = SdkQuery<"radar-get-bgp-routes-asns">;

const typedBuilder = withArgTypes<
	{
		"sort-by": Query["sortBy"];
		"sort-order": Query["sortOrder"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "ases",
	describe: "List ASes from global routing tables",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp routes ases",
				classification: {
					safeFlags: ["sort-by", "sort-order", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					location: argv["location"],
					limit: argv["limit"],
					sortBy: argv["sort-by"],
					sortOrder: argv["sort-order"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes ases",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/ases`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.bgp.routes.ases(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
