import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/user.ts
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
			"$0 user load-balancing-analytics events list\n\nList origin health changes."
		)
		.option("until", {
			type: "string",
			description:
				"End date and time of requesting data period in the ISO8601 format.",
		})
		.option("pool-name", {
			type: "string",
			description: "The name for the pool to filter.",
		})
		.option("origin-healthy", {
			type: "boolean",
			description:
				"If true, filter events where the origin status is healthy. If false, filter events where the origin status is unhealthy.",
		})
		.option("pool-id", { type: "string", description: "Pool ID" })
		.option("since", {
			type: "string",
			description:
				"Start date and time of requesting data period in the ISO8601 format.",
		})
		.option("origin-name", {
			type: "string",
			description: "The name for the origin to filter.",
		})
		.option("pool-healthy", {
			type: "boolean",
			description:
				"If true, filter events where the pool status is healthy. If false, filter events where the pool status is unhealthy.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Query =
	SdkQuery<"load-balancer-healthcheck-events-list-healthcheck-events">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Healthcheck Events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancing-analytics events list",
				classification: {
					safeFlags: ["origin-healthy", "pool-healthy", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					until: argv["until"],
					pool_name: argv["pool-name"],
					origin_healthy: argv["origin-healthy"],
					pool_id: argv["pool-id"],
					since: argv["since"],
					origin_name: argv["origin-name"],
					pool_healthy: argv["pool-healthy"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancing-analytics events list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/load_balancing_analytics/events`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.user.loadBalancingAnalytics.events.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
