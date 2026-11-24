import operation from "../_operations/custom-hostnames/list.js";
/**
 * list command
 * @generated from apis/overlays/custom-hostnames.ts
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
	describe: "List Custom Hostnames",
	usage:
		"$0 custom-hostnames list\n\nList, search, sort, and filter all of your custom hostnames.",
	flags: {
		hostname: {
			kind: "parsed",
			brief:
				"Fully qualified domain name to match against. This parameter cannot be used with the 'id', 'hostname.exact', 'hostname.contain', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		"hostname-exact": {
			kind: "parsed",
			brief:
				"Fully qualified domain name to match against. This parameter cannot be used with the 'id', 'hostname', 'hostname.contain', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		"hostname-starts-with": {
			kind: "parsed",
			brief:
				"Filters hostnames by a prefix match on the hostname value. This parameter cannot be used with the 'id', 'hostname', 'hostname.exact', or 'hostname.contain' parameters.",
			optional: true,
			parse: String,
		},
		"hostname-contain": {
			kind: "parsed",
			brief:
				"Filters hostnames by a substring match on the hostname value. This parameter cannot be used with the 'id', 'hostname', 'hostname.exact', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief:
				"Hostname ID to match against. This ID was generated and returned during the initial custom_hostname creation. This parameter cannot be used with the 'hostname', 'hostname.exact', 'hostname.contain', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of hostnames per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order hostnames by.",
			values: ["ssl", "ssl_status"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order hostnames.",
			values: ["asc", "desc"],
			optional: true,
		},
		"ssl-status": {
			kind: "enum",
			brief: "Filter by SSL certificate status.",
			values: [
				"initializing",
				"pending_validation",
				"deleted",
				"pending_issuance",
				"pending_deployment",
				"pending_deletion",
				"pending_expiration",
				"expired",
				"active",
				"initializing_timed_out",
				"validation_timed_out",
				"issuance_timed_out",
				"deployment_timed_out",
				"deletion_timed_out",
				"pending_cleanup",
				"staging_deployment",
				"staging_active",
				"deactivating",
				"inactive",
				"backup_issued",
				"holding_deployment",
			],
			optional: true,
		},
		"hostname-status": {
			kind: "enum",
			brief: "Filter by the hostname's activation status.",
			values: [
				"active",
				"pending",
				"active_redeploying",
				"moved",
				"pending_deletion",
				"deleted",
				"pending_blocked",
				"pending_migration",
				"pending_provisioned",
				"test_pending",
				"test_active",
				"test_active_apex",
				"test_blocked",
				"test_failed",
				"provisioned",
				"blocked",
			],
			optional: true,
		},
		"certificate-authority": {
			kind: "enum",
			brief:
				"Filter by the certificate authority that issued the SSL certificate.",
			values: ["google", "lets_encrypt", "ssl_com"],
			optional: true,
		},
		wildcard: {
			kind: "boolean",
			brief: "Filter by whether the custom hostname is a wildcard hostname.",
			optional: true,
		},
		"custom-origin-server": {
			kind: "parsed",
			brief: "Filter by custom origin server name.",
			optional: true,
			parse: String,
		},
		ssl: {
			kind: "enum",
			brief: "Whether to filter hostnames based on if they have SSL enabled.",
			values: ["0", "1"],
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
				command: "custom-hostnames list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"ssl-status",
						"hostname-status",
						"certificate-authority",
						"wildcard",
						"ssl",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					hostname: argv["hostname"],
					"hostname.exact": argv["hostname-exact"],
					"hostname.startsWith": argv["hostname-starts-with"],
					"hostname.contain": argv["hostname-contain"],
					id: argv["id"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					ssl_status: argv["ssl-status"],
					hostname_status: argv["hostname-status"],
					certificate_authority: argv["certificate-authority"],
					wildcard: argv["wildcard"],
					custom_origin_server: argv["custom-origin-server"],
					ssl: argv["ssl"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames`,
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
