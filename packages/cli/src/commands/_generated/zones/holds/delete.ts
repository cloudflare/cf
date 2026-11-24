import operation from "../../_operations/zones/holds/delete.js";
/**
 * delete command
 * @generated from apis/overlays/zones.ts
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
	command: "delete",
	describe: "Remove Zone Hold",
	usage:
		"$0 zones holds delete\n\nStop enforcement of a zone hold on the zone, permanently or temporarily, allowing the creation and activation of zones with this zone's hostname. Existing zone holds can be removed from CDN-only zones when `hold_after` is not provided. Active holds are automatically disabled when a zone transitions to CDN-only mode.",
	flags: {
		"hold-after": {
			kind: "parsed",
			brief:
				"If `hold_after` is provided, the hold will be temporarily disabled,\nthen automatically re-enabled by the system at the time specified\nin this RFC3339-formatted timestamp. Otherwise, the hold will be\ndisabled indefinitely. `hold_after` cannot be provided for CDN-only zones.",
			optional: true,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones holds delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					hold_after: argv["hold-after"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones holds delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/hold`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
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
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
