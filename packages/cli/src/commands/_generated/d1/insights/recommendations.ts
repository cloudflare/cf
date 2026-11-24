import operation from "../../_operations/d1/insights/recommendations.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * recommendations command
 * @generated from apis/overlays/d1.ts
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
			"$0 d1 insights recommendations\n\nList index recommendations for the databases in your account, or for the databases in `database_id`, from highest to lowest estimated impact. D1 generates recommendations in the background from recent query usage. Each run replaces the recommendations of the databases it analyzed. Recommendations that are not refreshed expire after 7 days. Not every database has recommendations. Recommendations are only generated and returned while `ai_enabled` is true in the account's D1 Insights settings. When it is false, the response is an empty list. To check or change the setting, use `GET` or `PUT /accounts/{account_id}/d1/insights/settings`."
		)
		.option("database-id", {
			type: "string",
			array: true,
			description:
				"Only return recommendations for these databases, at most 50. Pass a comma-separated list or repeat the parameter. Defaults to all databases in the account. A database that is not in the account returns no recommendations.",
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of recommendations to return in a page.",
		})
		.option("cursor", {
			type: "string",
			description:
				"`result_info.next_cursor` from the previous page. Pass the same `database_id` values as that request, or the request will fail.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "recommendations",
	describe: "List D1 Index Recommendations",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 insights recommendations",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					database_id: argv["database-id"],
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 insights recommendations",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/insights/recommendations`,
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
