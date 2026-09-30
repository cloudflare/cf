import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/web-assets.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 web-assets operations list\n\nLists web and API operations tracked for the zone, including each operation's method, path, and feature configuration."
		)
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Maximum number of results per page.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("order", {
			type: "string",
			description:
				"Field to order by. When requesting a feature, the feature keys are available for ordering as well, e.g., `thresholds.suggested_threshold`.",
			choices: ["method", "host", "endpoint", "thresholds.$key"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order results.",
			choices: ["asc", "desc"],
		})
		.option("host", {
			type: "string",
			description: "Filter results to only include the specified hosts.",
		})
		.option("method", {
			type: "string",
			description: "Filter results to only include the specified HTTP methods.",
		})
		.option("endpoint", {
			type: "string",
			description:
				"Filter results to only include endpoints containing this pattern.",
		})
		.option("feature", {
			type: "string",
			description:
				"Add feature(s) to the results. The feature name that is given here corresponds to the resulting feature object. Have a look at the top-level object description for more details on the specific meaning.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"api-shield-endpoint-management-retrieve-information-about-all-operations-on-a-zone">;
type Query =
	SdkQuery<"api-shield-endpoint-management-retrieve-information-about-all-operations-on-a-zone">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
		feature: Query["feature"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List web and API operations",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets operations list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					host: argv["host"],
					method: argv["method"],
					endpoint: argv["endpoint"],
					feature: argv["feature"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets operations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/operations`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.webAssets.operations.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
