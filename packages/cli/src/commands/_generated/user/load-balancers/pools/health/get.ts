import operation from "../../../../_operations/user/load-balancers/pools/health/get.js";
/**
 * get command
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
	command: "get <pool-id>",
	describe: "Pool Health Details",
	usage:
		"$0 user load-balancers pools health get <pool-id>\n\nFetch the latest pool health status for a single pool.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "pool-id", brief: "Pool ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers pools health get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers pools health get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools/${argv["pool-id"] == null ? "<pool-id>" : encodeURIComponent(String(argv["pool-id"]))}/health`,
						pathParams: { "pool-id": String(argv["pool-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { pool_id: argv["pool-id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
