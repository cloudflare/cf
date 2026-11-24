import operation from "../_operations/tenant-custom-nameservers/get.js";
/**
 * get command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <tenant-id>",
	describe: "List Tenant Custom Nameservers",
	usage:
		"$0 tenant-custom-nameservers get <tenant-id>\n\nLists a tenant's custom nameservers.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "tenant-id",
			brief: "Tenant identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant-custom-nameservers get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenant-custom-nameservers get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-id"] == null ? "<tenant-id>" : encodeURIComponent(String(argv["tenant-id"]))}/custom_ns`,
						pathParams: { "tenant-id": String(argv["tenant-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { tenant_id: argv["tenant-id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
