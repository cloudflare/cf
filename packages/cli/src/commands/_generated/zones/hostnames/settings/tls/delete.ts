import operation from "../../../../_operations/zones/hostnames/settings/tls/delete.js";
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
	command: "delete <hostname>",
	describe: "Delete TLS setting for hostname",
	usage:
		"$0 zones hostnames settings tls delete <hostname>\n\nDelete the tls setting value for the hostname.",
	flags: {
		"setting-id": {
			kind: "parsed",
			brief:
				'The TLS Setting name.\nThe value type depends on the setting:\n- `ciphers`: value is an array of cipher suite strings (e.g., `["ECDHE-RSA-AES128-GCM-SHA256", "AES128-GCM-SHA256"]`).\n- `min_tls_version`: value is a TLS version string (`"1.0"`, `"1.1"`, `"1.2"`, or `"1.3"`).\n- `http2`: value is `"on"` or `"off"`.',
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
			placeholder: "hostname",
			brief: "The hostname for which the tls settings are set.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones hostnames settings tls delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones hostnames settings tls delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/hostnames/settings/${argv["setting-id"] == null ? "<setting-id>" : encodeURIComponent(String(argv["setting-id"]))}/${argv["hostname"] == null ? "<hostname>" : encodeURIComponent(String(argv["hostname"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"setting-id": String(argv["setting-id"] ?? ""),
							hostname: String(argv["hostname"] ?? ""),
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
						setting_id: argv["setting-id"],
						hostname: argv["hostname"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
