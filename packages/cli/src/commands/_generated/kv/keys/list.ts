import operation from "../../_operations/kv/keys/list.js";
/**
 * list command
 * @generated from apis/overlays/kv.ts
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
	describe: "List keys in a namespace",
	usage:
		"$0 kv keys list\n\nLists key names in the specified Workers KV namespace, with expiration times and metadata when present. Use `prefix` to filter names and `cursor` to request the next page. Values are not included.",
	flags: {
		"namespace-id": {
			kind: "parsed",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of keys to return in one response. Pass `result_info.cursor` from the response as `cursor` to request the next page.",
			optional: true,
			parse: Number,
		},
		prefix: {
			kind: "parsed",
			brief:
				"Filters returned keys by a name prefix. Exact matches and any key names that begin with the prefix will be returned.",
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque pagination token from `result_info.cursor` in the previous response. Pass it unchanged to request the next page of keys.",
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
				command: "kv keys list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					prefix: argv["prefix"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv keys list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/keys`,
						pathParams: { "namespace-id": String(argv["namespace-id"] ?? "") },
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
						namespace_id: argv["namespace-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
