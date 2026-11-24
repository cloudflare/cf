import operation from "../../_operations/organizations/members/delete.js";
/**
 * delete command
 * @generated from apis/overlays/organizations.ts
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
	command: "delete <member-id>",
	describe: "Delete organization member",
	usage:
		"$0 organizations members delete <member-id>\n\nDelete a membership to a particular Organization.",
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "Organization ID",
			parse: String,
		},
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
			placeholder: "member-id",
			brief: "Organization Member ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations members delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations members delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members/${argv["member-id"] == null ? "<member-id>" : encodeURIComponent(String(argv["member-id"]))}`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
							"member-id": String(argv["member-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Delete this organization membership? The member will lose access to this organization and its sub-organizations.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						organization_id: argv["organization-id"],
						member_id: argv["member-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
