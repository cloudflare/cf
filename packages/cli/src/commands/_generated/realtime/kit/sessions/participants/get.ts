import operation from "../../../../_operations/realtime/kit/sessions/participants/get.js";
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
	command: "get <participant-id>",
	describe: "Fetch details of a participant",
	usage:
		"$0 realtime kit sessions participants get <participant-id>\n\nReturns details of the given participant ID for the given session ID. Use the peer report endpoint to retrieve call statistics.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"session-id": { kind: "parsed", brief: "ID of the session", parse: String },
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
		{
			placeholder: "participant-id",
			brief: "ID of the participant",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit sessions participants get",
				classification: {
					safeFlags: ["include-peer-events", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					include_peer_events: argv["include-peer-events"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit sessions participants get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/sessions/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/participants/${argv["participant-id"] == null ? "<participant-id>" : encodeURIComponent(String(argv["participant-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"session-id": String(argv["session-id"] ?? ""),
							"participant-id": String(argv["participant-id"] ?? ""),
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
						session_id: argv["session-id"],
						participant_id: argv["participant-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
