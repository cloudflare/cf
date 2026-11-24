import operation from "../../../../_operations/zones/hostnames/settings/tls/get.js";
/**
 * get command
 * @generated from apis/overlays/zones.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <setting-id>",
	describe: "List TLS setting for hostnames",
	usage:
		"$0 zones hostnames settings tls get <setting-id>\n\nList the requested TLS setting for the hostnames under this zone.",
	flags: {
		page: {
			kind: "parsed",
			brief:
				"Page number, starting at 1. Defaults to 1. Ignored when offset is provided.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of results per page. Defaults to 50 when neither per_page nor limit is provided. Ignored when limit is provided. Values above 1000 are capped at 1000.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief:
				"Alias for per_page. Defaults to 50 when neither per_page nor limit is provided. Takes precedence over per_page. Values above 1000 are capped at 1000.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Number of results to skip. Defaults to 0. Takes precedence over page, including when offset is 0.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "setting-id",
			brief:
				'The TLS Setting name. The value type depends on the setting: - \`ciphers\`: value is an array of cipher suite strings (e.g., \`["ECDHE-RSA-AES128-GCM-SHA256", "AES128-GCM-SHA256"]\`). - \`min_tls_version\`: value is a TLS version string (\`"1.0"\`, \`"1.1"\`, \`"1.2"\`, or \`"1.3"\`). - \`http2\`: value is \`"on"\` or \`"off"\`.',
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones hostnames settings tls get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					limit: argv["limit"],
					offset: argv["offset"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones hostnames settings tls get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/hostnames/settings/${argv["setting-id"] == null ? "<setting-id>" : encodeURIComponent(String(argv["setting-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"setting-id": String(argv["setting-id"] ?? ""),
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
					client.send(operation, {
						zone_id: zoneId,
						setting_id: argv["setting-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
