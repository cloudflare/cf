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
			"$0 web-assets discovery operations list\n\nReturns the latest web and API operations discovered from zone traffic."
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
		.option("direction", {
			type: "string",
			description: "Direction to order results.",
			choices: ["asc", "desc"],
		})
		.option("order", {
			type: "string",
			description: "Field to order by",
			choices: [
				"host",
				"method",
				"endpoint",
				"traffic_stats.requests",
				"traffic_stats.last_updated",
			],
		})
		.option("diff", {
			type: "boolean",
			description:
				"When `true`, only return API Discovery results that are not saved into API Shield Endpoint Management",
		})
		.option("origin", {
			type: "string",
			description:
				"Filter results to only include discovery results sourced from a particular discovery engine\n  * `ML` - Discovered operations that were sourced using ML API Discovery\n  * `SessionIdentifier` - Discovered operations that were sourced using Session Identifier API Discovery",
			choices: ["ML", "SessionIdentifier", "LabelDiscovery"],
		})
		.option("state", {
			type: "string",
			description:
				"Filter results to only include discovery results in a particular state. States are as follows\n  * `review` - Discovered operations that are not saved into API Shield Endpoint Management\n  * `saved` - Discovered operations that are already saved into API Shield Endpoint Management\n  * `ignored` - Discovered operations that have been marked as ignored",
			choices: ["review", "saved", "ignored"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"api-shield-api-discovery-retrieve-discovered-operations-on-a-zone">;
type Query =
	SdkQuery<"api-shield-api-discovery-retrieve-discovered-operations-on-a-zone">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		order: Query["order"];
		origin: Query["origin"];
		state: Query["state"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List discovered web and API operations",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets discovery operations list",
				classification: {
					safeFlags: [
						"direction",
						"order",
						"diff",
						"origin",
						"state",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					host: argv["host"],
					method: argv["method"],
					endpoint: argv["endpoint"],
					direction: argv["direction"],
					order: argv["order"],
					diff: argv["diff"],
					origin: argv["origin"],
					state: argv["state"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets discovery operations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/discovery/operations`,
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
					client.webAssets.discovery.operations.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
