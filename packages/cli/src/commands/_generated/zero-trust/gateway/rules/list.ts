import operation from "../../../_operations/zero-trust/gateway/rules/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "List Zero Trust Gateway rules",
	usage:
		"$0 zero-trust gateway rules list\n\nList Zero Trust Gateway rules for an account.",
	flags: {
		filter: {
			kind: "parsed",
			brief:
				"Filter the returned rules by one or more `field:value` pairs. Repeat the\nparameter to combine filters with logical AND.\n\nSupported fields are `name`, `id`, `action`, `enabled`, `source_account`,\n`is_shared`, `filters`, and `expression` (max 1024 bytes). The `source_account`\nvalue is matched as a normalized UUID substring. The `filters` value must\nbe one of the rule filter names and matches a member of the rule's `filters`\narray. The `expression` filter performs a case-insensitive literal\nsubstring match across traffic, identity, and device posture expressions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Case-insensitive substring search across rule name and description.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort the returned rules by. Supported values are `name`,\n`created_at`, `updated_at`, and `precedence`.",
			values: ["name", "created_at", "updated_at", "precedence"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction. When `order_by` is omitted, this controls the direction\nof the existing precedence ordering. Shared rules remain first in either\ndirection. Accepted values are `asc` and `desc`.",
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
				command: "zero-trust gateway rules list",
				classification: {
					safeFlags: ["order-by", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					filter: argv["filter"],
					search: argv["search"],
					order_by: argv["order-by"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/rules`,
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
