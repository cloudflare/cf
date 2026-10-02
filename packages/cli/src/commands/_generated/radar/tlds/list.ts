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
		.usage("$0 radar tlds list\n\nRetrieves a list of TLDs.")
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("offset", {
			type: "number",
			description:
				"Skips the specified number of objects before fetching the results.",
		})
		.option("tld-manager", {
			type: "string",
			description: "Filters results by TLD manager.",
		})
		.option("tld-type", {
			type: "string",
			description: "Filters results by TLD type.",
			choices: [
				"GENERIC",
				"COUNTRY_CODE",
				"GENERIC_RESTRICTED",
				"INFRASTRUCTURE",
				"SPONSORED",
			],
		})
		.option("tld", {
			type: "string",
			description:
				"Filters results by top-level domain. Specify a comma-separated list of TLDs.",
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

type Query = SdkQuery<"radar-get-tlds">;

const typedBuilder = withArgTypes<
	{
		"tld-type": Query["tldType"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List TLDs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar tlds list",
				classification: {
					safeFlags: ["tld-type", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					offset: argv["offset"],
					tldManager: argv["tld-manager"],
					tldType: argv["tld-type"],
					tld: argv["tld"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar tlds list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/tlds`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.tlds.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
