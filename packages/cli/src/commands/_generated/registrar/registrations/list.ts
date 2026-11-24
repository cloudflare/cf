import operation from "../../_operations/registrar/registrations/list.js";
/**
 * list command
 * @generated from apis/overlays/registrar.ts
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
	describe: "List Registrations",
	usage:
		"$0 registrar registrations list\n\nReturns a paginated list of domain registrations owned by the account. This endpoint uses cursor-based pagination. Results are ordered by registration date by default. To fetch the next page, pass the `cursor` value from the `result_info` object in the response as the `cursor` query parameter in your next request. An empty `cursor` string indicates there are no more pages.",
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token from a previous response's `result_info.cursor`.\nPass this value to fetch the next page of results. Omit (or\npass an empty string) for the first page.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items to return per page.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction for results. Defaults to ascending order.",
			values: ["asc", "desc"],
			optional: true,
		},
		"sort-by": {
			kind: "enum",
			brief:
				"Column to sort results by. Defaults to registration date (`registry_created_at`) when omitted.",
			values: ["registry_created_at", "registry_expires_at", "name"],
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
				command: "registrar registrations list",
				classification: {
					safeFlags: ["direction", "sort-by", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					direction: argv["direction"],
					sort_by: argv["sort-by"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar registrations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/registrations`,
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
