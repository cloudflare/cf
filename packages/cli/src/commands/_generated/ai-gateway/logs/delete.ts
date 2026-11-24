import operation from "../../_operations/ai-gateway/logs/delete.js";
/**
 * delete command
 * @generated from apis/overlays/ai-gateway.ts
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <gateway-id>",
	describe: "Delete Gateway Logs",
	usage:
		"$0 ai-gateway logs delete <gateway-id>\n\nDeletes gateway log entries matching the specified criteria.",
	flags: {
		"order-by": {
			kind: "enum",
			brief: "Order by",
			values: [
				"created_at",
				"provider",
				"model",
				"model_type",
				"success",
				"cached",
				"cost",
				"tokens_in",
				"tokens_out",
				"duration",
				"feedback",
			],
			optional: true,
		},
		"order-by-direction": {
			kind: "enum",
			brief: "Order by direction",
			values: ["asc", "desc"],
			optional: true,
		},
		filters: {
			kind: "parsed",
			brief: "Filters",
			variadic: true,
			optional: true,
			parse: String,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "gateway-id",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway logs delete",
				classification: {
					safeFlags: ["order-by", "order-by-direction", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					order_by: argv["order-by"],
					order_by_direction: argv["order-by-direction"],
					filters: argv["filters"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway logs delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/logs`,
						pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This permanently deletes every stored log entry on the gateway that matches the filters. Deleted logs cannot be recovered.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
