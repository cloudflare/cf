import operation from "../../_operations/cloudforce-one/rules/list.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
	describe: "List rules",
	usage:
		"$0 cloudforce-one rules list\n\nReturns all rules for an account with optional filtering.",
	flags: {
		namespace: {
			kind: "parsed",
			brief:
				"Selects namespaces. Repeat the parameter to select multiple namespaces (for example, namespace=foo&namespace=bar).",
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief:
				"Selects paths with exact-match semantics. Omit the parameter to return rules from all paths. Pass an empty string (path=) to return only rules with an empty or uncategorized path. Pass a value (for example, path=yara) to match that exact path. Repeat the parameter (for example, path=yara&path=expr) to OR-match multiple paths with SQL `IN (...)` semantics. The `recursive` flag affects only customer-account namespace selection.",
			optional: true,
			parse: String,
		},
		recursive: {
			kind: "enum",
			brief:
				"For customer accounts, true enables descendant matching for namespaces. Paths always use exact matching.",
			values: ["true", "false"],
			optional: true,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		"is-public": {
			kind: "enum",
			brief: "Limits rules to the specified public visibility.",
			values: ["true", "false"],
			optional: true,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
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
				command: "cloudforce-one rules list",
				classification: {
					safeFlags: ["recursive", "is-public", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					namespace: argv["namespace"],
					path: argv["path"],
					recursive: argv["recursive"],
					search: argv["search"],
					is_public: argv["is-public"],
					limit: argv["limit"],
					offset: argv["offset"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
