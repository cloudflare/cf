import operation from "../../../../_operations/realtime/kit/sessions/peers/get.js";
/**
 * get command
 * @generated from apis/overlays/realtime.ts
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
	command: "get <peer-id>",
	describe: "Fetch details of peer",
	usage:
		"$0 realtime kit sessions peers get <peer-id>\n\nReturns participant details for the given peer ID along with call statistics.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		filters: {
			kind: "enum",
			brief: "Filter to apply to the peer report.",
			values: [
				"device_info",
				"ip_information",
				"precall_network_information",
				"events",
				"quality_stats",
			],
			optional: true,
		},
		"include-peer-events": {
			kind: "boolean",
			brief: "if true, response includes all the peer events of participant.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "peer-id", brief: "ID of the peer", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit sessions peers get",
				classification: {
					safeFlags: ["filters", "include-peer-events", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					filters: argv["filters"],
					include_peer_events: argv["include-peer-events"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit sessions peers get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/sessions/peer-report/${argv["peer-id"] == null ? "<peer-id>" : encodeURIComponent(String(argv["peer-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"peer-id": String(argv["peer-id"] ?? ""),
						},
						query: queryParams,
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
						app_id: argv["app-id"],
						peer_id: argv["peer-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
