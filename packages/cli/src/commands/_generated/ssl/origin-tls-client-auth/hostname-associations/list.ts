import operation from "../../../_operations/ssl/origin-tls-client-auth/hostname-associations/list.js";
/**
 * list command
 * @generated from apis/overlays/ssl.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Hostname Associations",
	usage:
		"$0 ssl origin-tls-client-auth hostname-associations list\n\nList certificate ID - hostname associations for the given zone. Shows which hostnames are associated to which certificates for authenticated origin pulls.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of associations per page.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief:
				'Filter associations by status. Use comma-separated values to filter by multiple statuses, or "all" to include every status. Defaults to "active" if not provided.',
			values: [
				"active",
				"pending_deployment",
				"pending_deletion",
				"deleted",
				"deployment_timed_out",
				"deletion_timed_out",
				"all",
			],
			optional: true,
		},
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
				command: "ssl origin-tls-client-auth hostname-associations list",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl origin-tls-client-auth hostname-associations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin_tls_client_auth/hostnames`,
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

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
