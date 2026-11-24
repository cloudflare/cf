import operation from "../../_operations/email-security/domains/list.js";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
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
	describe: "List protected email domains",
	usage:
		"$0 email-security domains list\n\nReturns a paginated list of email domains protected by Email Security. Includes domain configuration, delivery modes, and authorization status. Supports filtering by delivery mode and integration ID.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search term for filtering records. Behavior may change.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: ["domain", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		"allowed-delivery-mode": {
			kind: "enum",
			brief: "Delivery mode to filter by.",
			values: ["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"],
			optional: true,
		},
		domain: {
			kind: "parsed",
			brief: "Domain names to filter by.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"active-delivery-mode": {
			kind: "enum",
			brief: "Currently active delivery mode to filter by.",
			values: ["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"],
			optional: true,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Integration ID to filter by.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filters response to domains with the provided status.",
			values: ["PENDING", "ACTIVE", "FAILED", "TIMEOUT"],
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
				command: "email-security domains list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"allowed-delivery-mode",
						"active-delivery-mode",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					order: argv["order"],
					direction: argv["direction"],
					allowed_delivery_mode: argv["allowed-delivery-mode"],
					domain: argv["domain"],
					active_delivery_mode: argv["active-delivery-mode"],
					integration_id: argv["integration-id"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security domains list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/domains`,
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
