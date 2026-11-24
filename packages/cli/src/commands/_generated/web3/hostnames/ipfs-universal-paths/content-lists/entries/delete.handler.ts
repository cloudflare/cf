import operation from "../../../../../_operations/web3/hostnames/ipfs-universal-paths/content-lists/entries/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
					content_list_entry_identifier: argv["content-list-entry-identifier"],
				})
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
