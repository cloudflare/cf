import operation from "../_operations/custom-hostnames/delete.js";
/**
 * delete command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <custom-hostname-id>",
	describe: "Delete Custom Hostname (and any issued SSL certificates)",
	usage:
		"$0 custom-hostnames delete <custom-hostname-id>\n\nPermanently deletes a custom hostname and revokes any SSL certificates that were issued for it. This action cannot be undone.",
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
			placeholder: "custom-hostname-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-hostnames delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames/${argv["custom-hostname-id"] == null ? "<custom-hostname-id>" : encodeURIComponent(String(argv["custom-hostname-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"custom-hostname-id": String(argv["custom-hostname-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						zone_id: zoneId,
						custom_hostname_id: argv["custom-hostname-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
