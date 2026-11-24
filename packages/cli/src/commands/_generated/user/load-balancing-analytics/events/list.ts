import operation from "../../../_operations/user/load-balancing-analytics/events/list.js";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Healthcheck Events",
	usage:
		"$0 user load-balancing-analytics events list\n\nList origin health changes.",
	flags: {
		until: {
			kind: "parsed",
			brief:
				"End date and time of requesting data period in the ISO8601 format.",
			optional: true,
			parse: String,
		},
		"pool-name": {
			kind: "parsed",
			brief: "The name for the pool to filter.",
			optional: true,
			parse: String,
		},
		"origin-healthy": {
			kind: "boolean",
			brief:
				"If true, filter events where the origin status is healthy. If false, filter events where the origin status is unhealthy.",
			optional: true,
		},
		"pool-id": {
			kind: "parsed",
			brief: "Pool ID",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief:
				"Start date and time of requesting data period in the ISO8601 format.",
			optional: true,
			parse: String,
		},
		"origin-name": {
			kind: "parsed",
			brief: "The name for the origin to filter.",
			optional: true,
			parse: String,
		},
		"pool-healthy": {
			kind: "boolean",
			brief:
				"If true, filter events where the pool status is healthy. If false, filter events where the pool status is unhealthy.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancing-analytics events list",
				classification: {
					safeFlags: ["origin-healthy", "pool-healthy", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
