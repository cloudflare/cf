import operation from "../../../_operations/rules/lists/items/list.js";
/**
 * list command
 * @generated from apis/overlays/rules.ts
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
	describe: "Get list items",
	usage: "$0 rules lists items list\n\nFetches all the items in the list.",
	flags: {
		"list-id": {
			kind: "parsed",
			brief: "The unique ID of the list.",
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"The pagination cursor. An opaque string token that indicates where to continue when requesting the next/previous set of records. The response provides cursor values under `result_info.cursors`. You should make no assumptions about a cursor's content or length.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Amount of results to include in each paginated response. A non-negative 32 bit integer.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				"A search query to filter returned items. Its meaning depends on the list type: IP addresses must start with the provided string, hostnames and bulk redirects must contain the string, and ASNs must match the string exactly.",
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
				command: "rules lists items list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					search: argv["search"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rules lists items list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rules/lists/${argv["list-id"] == null ? "<list-id>" : encodeURIComponent(String(argv["list-id"]))}/items`,
						pathParams: { "list-id": String(argv["list-id"] ?? "") },
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
						list_id: argv["list-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
