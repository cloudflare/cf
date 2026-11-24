import operation from "../../../_operations/user/load-balancers/monitors/delete.js";
/**
 * delete command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <monitor-id>",
	describe: "Delete Monitor",
	usage:
		"$0 user load-balancers monitors delete <monitor-id>\n\nDelete a configured monitor.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "monitor-id", brief: "Monitor ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers monitors delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers monitors delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/monitors/${argv["monitor-id"] == null ? "<monitor-id>" : encodeURIComponent(String(argv["monitor-id"]))}`,
						pathParams: { "monitor-id": String(argv["monitor-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, { monitor_id: argv["monitor-id"] })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
