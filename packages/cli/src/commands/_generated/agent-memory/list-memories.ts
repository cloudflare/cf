import operation from "../_operations/agent-memory/list-memories.js";
/**
 * list-memories command
 * @generated from apis/overlays/agent-memory.ts
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
	command: "list-memories <profile-name>",
	describe: "List memories",
	usage:
		"$0 agent-memory list-memories <profile-name>\n\nList memories stored in a profile.",
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Continuation cursor for paginated results.",
			optional: true,
			parse: String,
		},
		"session-id": {
			kind: "parsed",
			brief: "Session identifier for filtering.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "enum",
			brief: "Memory type for filtering.",
			values: ["fact", "event", "instruction", "task"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "profile-name", brief: "Profile name.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory list-memories",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					session_id: argv["session-id"],
					type: argv["type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory list-memories",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/memories`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
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
						namespace_name: argv["namespace-name"],
						profile_name: argv["profile-name"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
