import operation from "../../_operations/o11y/issues/list.js";
/**
 * list command
 * @generated from apis/overlays/o11y.ts
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
	describe: "List detected issues",
	usage: "$0 o11y issues list\n\nList detected issues.",
	flags: {
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "PerPage",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Order",
			values: ["asc", "desc"],
			optional: true,
		},
		"order-by": {
			kind: "enum",
			brief: "OrderBy",
			values: [
				"id",
				"service",
				"title",
				"type",
				"status",
				"statusUpdated",
				"count",
				"firstObserved",
				"lastObserved",
				"created",
				"updated",
			],
			optional: true,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		service: {
			kind: "parsed",
			brief: "Service",
			optional: true,
			parse: String,
		},
		type: { kind: "parsed", brief: "Type", optional: true, parse: String },
		status: {
			kind: "enum",
			brief: "Status",
			values: ["active", "resolved", "ignored"],
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
				command: "o11y issues list",
				classification: {
					safeFlags: ["order", "order-by", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					perPage: argv["per-page"],
					order: argv["order"],
					orderBy: argv["order-by"],
					search: argv["search"],
					service: argv["service"],
					type: argv["type"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y issues list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/issues`,
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
