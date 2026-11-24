import operation from "../../../../../_operations/web3/hostnames/ipfs-universal-paths/content-lists/entries/delete.js";
/**
 * delete command
 * @generated from apis/overlays/web3.ts
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
	command: "delete <content-list-entry-identifier>",
	describe: "Delete IPFS Universal Path Gateway Content List Entry",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists entries delete <content-list-entry-identifier>\n\nDeletes an entry from an IPFS Universal Path Gateway content list.",
	flags: {
		identifier: {
			kind: "parsed",
			brief: "Specify the identifier of the hostname.",
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
			placeholder: "content-list-entry-identifier",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"web3 hostnames ipfs-universal-paths content-lists entries delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command:
							"cf web3 hostnames ipfs-universal-paths content-lists entries delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list/entries/${argv["content-list-entry-identifier"] == null ? "<content-list-entry-identifier>" : encodeURIComponent(String(argv["content-list-entry-identifier"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							identifier: String(argv["identifier"] ?? ""),
							"content-list-entry-identifier": String(
								argv["content-list-entry-identifier"] ?? ""
							),
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
						identifier: argv["identifier"],
						content_list_entry_identifier:
							argv["content-list-entry-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
