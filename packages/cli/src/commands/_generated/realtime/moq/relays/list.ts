import operation from "../../../_operations/realtime/moq/relays/list.js";
/**
 * list command
 * @generated from apis/overlays/realtime.ts
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
	describe: "List relays",
	usage:
		"$0 realtime moq relays list\n\nLists all MoQ relays for the account. Returns only metadata. Config, status, and tokens are omitted. Results are cursor-paginated (keyset on the `created` timestamp). Use `created_before` / `created_after` with the `created` value of the first/last item in a page to fetch the adjacent page. `result_info` reports the page `count` and the `total` matching the cursor filters.",
	flags: {
		"created-before": {
			kind: "parsed",
			brief:
				"Cursor for pagination. Returns relays created strictly before this\nRFC 3339 timestamp (typically the `created` value of the first item\non the current page, to fetch the previous page).",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief:
				"Cursor for pagination. Returns relays created strictly after this\nRFC 3339 timestamp (typically the `created` value of the last item\non the current page, to fetch the next page).",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Maximum number of relays to return per page. Values above the maximum are\nclamped to it rather than rejected.",
			optional: true,
			parse: Number,
		},
		asc: {
			kind: "boolean",
			brief:
				"Sort order by `created`. When true, results are returned oldest-first\n(ascending); otherwise newest-first (descending, the default).",
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
				command: "realtime moq relays list",
				classification: {
					safeFlags: ["asc", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					created_before: argv["created-before"],
					created_after: argv["created-after"],
					per_page: argv["per-page"],
					asc: argv["asc"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime moq relays list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/moq/relays`,
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
