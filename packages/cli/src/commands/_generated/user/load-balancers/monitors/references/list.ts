import operation from "../../../../_operations/user/load-balancers/monitors/references/list.js";
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
	describe: "List Monitor References",
	usage:
		"$0 user load-balancers monitors references list\n\nGet the list of resources that reference the provided monitor.",
	flags: {
		"monitor-id": { kind: "parsed", brief: "Monitor ID", parse: String },
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
				command: "user load-balancers monitors references list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers monitors references list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/monitors/${argv["monitor-id"] == null ? "<monitor-id>" : encodeURIComponent(String(argv["monitor-id"]))}/references`,
						pathParams: { "monitor-id": String(argv["monitor-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { monitor_id: argv["monitor-id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
