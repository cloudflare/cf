import operation from "../../_operations/tunnels/connectors/get.js";
/**
 * get command
 * @generated from apis/overlays/tunnels.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <connector-id>",
	describe: "Get Cloudflare Tunnel connector",
	usage:
		"$0 tunnels connectors get <connector-id>\n\nRetrieves a connector and its connection details for a Cloudflare Tunnel, including its cloudflared version, architecture, and connected Cloudflare locations.",
	flags: {
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "connector-id",
			brief: "UUID of the Cloudflare Tunnel connector.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels connectors get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels connectors get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cfd_tunnel/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}`,
						pathParams: {
							"tunnel-id": String(argv["tunnel-id"] ?? ""),
							"connector-id": String(argv["connector-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
						connector_id: argv["connector-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
