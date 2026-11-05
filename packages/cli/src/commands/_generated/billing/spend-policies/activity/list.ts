import operation from "../../../_operations/billing/spend-policies/activity/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing spend-policies activity list\n\nReturns configuration history from immutable policy revisions for the account, including deleted policies. Entries contain before/after values and verified actor attribution. Pages use descending revision IDs, not event or commit order; refresh the first page for new entries. This cursor is not an incremental consumer checkpoint. Defaults to `period=current_billing_cycle`: each revision's timestamp must be within its product's current subscription cycle (inclusive start, exclusive end). Each product's cycle is resolved independently from canonical aggregates, including for disabled or deleted policies. Set `period=all` for history across cycles. Filtering happens before pagination. No current cycles returns an empty page; unavailable or disabled cycle resolution returns `503` with code `1013`. Cursors pin resolved cycle bounds across pages and must be used with the same period selection. Cursors obtained before this filter was introduced must be refreshed."
		)
		.option("limit", {
			type: "number",
			description:
				"Maximum number of audit entries to return. Defaults to 50. Values above 100 are capped at 100 rather than rejected.",
		})
		.option("period", {
			type: "string",
			description:
				"Select current subscription billing-cycle history or history across all cycles.",
			choices: ["current_billing_cycle", "all"],
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque token from the preceding response's result_info.cursor. Pass it unchanged to retrieve older entries.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Spend Policy Activity",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing spend-policies activity list",
				classification: {
					safeFlags: ["period", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					period: argv["period"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing spend-policies activity list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/spend-policies/activity`,
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
};

export default command;
