import operation from "../../_operations/brand-protection/queries/get.js";
/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
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
	command: "get",
	describe: "List domain queries",
	usage:
		"$0 brand-protection queries get\n\nLists the account's saved domain queries, most recently updated first. Set `id` to return a single query object instead of an array. Set `page` or `per_page` to paginate the list; the response then includes `result_info`. Without them, every query is returned.",
	flags: {
		id: {
			kind: "parsed",
			brief:
				"ID of a domain query. When set, `result` is that single query object instead of an array, and `page` and `per_page` are ignored.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				"Page number for paginated list requests. Defaults to 1 when only per_page is supplied. Omit page and per_page to return every query.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of queries per page for paginated list requests. Defaults to 100 when only page is supplied. Maximum 100. Omit page and per_page to return every query.",
			optional: true,
			parse: Number,
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
				command: "brand-protection queries get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					id: argv["id"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection queries get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/domain/queries`,
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
