import operation from "../../../_operations/artifacts/namespaces/repos/list.js";
/**
 * list command
 * @generated from apis/overlays/artifacts.ts
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
	describe: "List repositories",
	usage:
		"$0 artifacts namespaces repos list\n\nLists repositories in a namespace.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: String },
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		sort: {
			kind: "enum",
			brief: "Sort",
			values: ["created_at", "updated_at", "last_push_at", "name"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction",
			values: ["asc", "desc"],
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
				command: "artifacts namespaces repos list",
				classification: {
					safeFlags: ["sort", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					cursor: argv["cursor"],
					search: argv["search"],
					sort: argv["sort"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces repos list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/repos`,
						pathParams: { namespace: String(argv["namespace"] ?? "") },
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
						namespace: argv["namespace"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
