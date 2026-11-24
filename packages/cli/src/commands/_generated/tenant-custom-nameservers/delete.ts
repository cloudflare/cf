import operation from "../_operations/tenant-custom-nameservers/delete.js";
/**
 * delete command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
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
	command: "delete <custom-ns-id>",
	describe: "Delete Tenant Custom Nameserver",
	usage:
		"$0 tenant-custom-nameservers delete <custom-ns-id>\n\nDeletes a tenant's custom nameserver.",
	flags: {
		"tenant-id": {
			kind: "parsed",
			brief: "Tenant identifier tag.",
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
			placeholder: "custom-ns-id",
			brief: "The FQDN of the name server.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant-custom-nameservers delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenant-custom-nameservers delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-id"] == null ? "<tenant-id>" : encodeURIComponent(String(argv["tenant-id"]))}/custom_ns/${argv["custom-ns-id"] == null ? "<custom-ns-id>" : encodeURIComponent(String(argv["custom-ns-id"]))}`,
						pathParams: {
							"tenant-id": String(argv["tenant-id"] ?? ""),
							"custom-ns-id": String(argv["custom-ns-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						tenant_id: argv["tenant-id"],
						custom_ns_id: argv["custom-ns-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
