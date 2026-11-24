import operation from "../../_operations/scim/users/list.js";
/**
 * list command
 * @generated from apis/overlays/scim.ts
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
	describe: "List SCIM Users",
	usage:
		'$0 scim users list\n\nLists account members as SCIM User resources. Supports optional filtering by `userName` (email) using the SCIM filter syntax (e.g. `userName eq "user@example.com"`). Pagination is controlled via `startIndex` and `count` query parameters per RFC 7644 Section 3.4.2.4.',
	flags: {
		"start-index": {
			kind: "parsed",
			brief:
				"The 1-based index of the first result in the current set of list results. Values less than 1 are treated as 1.",
			optional: true,
			parse: Number,
		},
		count: {
			kind: "parsed",
			brief: "Specifies the desired maximum number of query results per page.",
			optional: true,
			parse: Number,
		},
		filter: {
			kind: "parsed",
			brief:
				'SCIM filter expression (RFC 7644 Section 3.4.2.2). Only `userName eq "value"` is supported.',
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
				command: "scim users list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					startIndex: argv["start-index"],
					count: argv["count"],
					filter: argv["filter"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf scim users list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/scim/v2/Users`,
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
