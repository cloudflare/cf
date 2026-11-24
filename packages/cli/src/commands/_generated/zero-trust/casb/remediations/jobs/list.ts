import operation from "../../../../_operations/zero-trust/casb/remediations/jobs/list.js";
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
	describe: "List remediation jobs",
	usage:
		"$0 zero-trust casb remediations jobs list\n\nList all remediation jobs tied to a specific Cloudflare Account. Note that `cursor` and `page` are mutually exclusive.",
	flags: {
		cursor: {
			kind: "parsed",
			brief: "A cursor for pagination.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		"min-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediations updated on or after the min updated datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"max-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediations updated on or before the max updated datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter to view remediations with the given status.",
			values: ["pending", "processing", "completed", "failed", "validating"],
			optional: true,
		},
		"triggered-by-actor": {
			kind: "parsed",
			brief:
				"Filter remediations by what kind of actor triggered them. Supports multiple comma-separated values.",
			variadic: true,
			optional: true,
			choices: ["user", "account_token"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by an integration ID",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "An optional param to sort the results by the given field.",
			values: [
				"created_at",
				"affliction_date",
				"integration_name",
				"status",
				"last_updated_at",
				"asset_name",
				"finding_type_name",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
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
				command: "zero-trust casb remediations jobs list",
				classification: {
					safeFlags: ["status", "order", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					min_updated_at: argv["min-updated-at"],
					max_updated_at: argv["max-updated-at"],
					status: argv["status"],
					triggered_by_actor: argv["triggered-by-actor"],
					integration_id: argv["integration-id"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb remediations jobs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/remediations/jobs`,
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
