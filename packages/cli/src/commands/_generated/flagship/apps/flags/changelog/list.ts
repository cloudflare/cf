import operation from "../../../../_operations/flagship/apps/flags/changelog/list.js";
/**
 * list command
 * @generated from apis/overlays/flagship.ts
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
	command: "list",
	describe: "List flag changelog entries",
	usage:
		"$0 flagship apps flags changelog list\n\nReturns the audit history for a flag, newest first. Each entry includes the event type and full flag state after the change; `update` entries include a field-level diff. Capped at 200 entries per flag.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
		"flag-key": {
			kind: "parsed",
			brief: "Case-sensitive key identifying the flag within the app.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Max items to return (1–200).",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor from a previous response.",
			optional: true,
			parse: String,
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
				command: "flagship apps flags changelog list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf flagship apps flags changelog list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags/${argv["flag-key"] == null ? "<flag-key>" : encodeURIComponent(String(argv["flag-key"]))}/changelog`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"flag-key": String(argv["flag-key"] ?? ""),
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
						flag_key: argv["flag-key"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
