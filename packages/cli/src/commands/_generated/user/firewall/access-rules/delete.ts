import operation from "../../../_operations/user/firewall/access-rules/delete.js";
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
	command: "delete <rule-id>",
	describe: "Delete an IP Access rule",
	usage:
		"$0 user firewall access-rules delete <rule-id>\n\nDeletes an IP Access rule at the user level. Note: Deleting a user-level rule will affect all zones owned by the user.",
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
	operands: [
		{
			placeholder: "rule-id",
			brief: "Unique identifier for a rule.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user firewall access-rules delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user firewall access-rules delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes the user-level IP Access Rule and affects every zone owned by the user.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, { rule_id: argv["rule-id"] })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
