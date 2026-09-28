import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 buckets list\n\nLists a page of R2 buckets in the account and selected jurisdiction. Use the returned cursor to retrieve the next page."
		)
		.option("name-contains", {
			type: "string",
			description:
				"Bucket names to filter by. Only buckets with this phrase in their name will be returned.",
		})
		.option("start-after", {
			type: "string",
			description:
				"Bucket name to start searching after. Buckets are ordered lexicographically.",
		})
		.option("per-page", {
			type: "number",
			description: "Maximum number of buckets to return in a single call.",
		})
		.option("order", {
			type: "string",
			description: "Field to order buckets by.",
			choices: ["name"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order buckets.",
			choices: ["asc", "desc"],
		})
		.option("cursor", {
			type: "string",
			description:
				"Pagination cursor received during the last List Buckets call. R2 buckets are paginated using cursors instead of page numbers.",
		})
		.option("cf-r2-jurisdiction", {
			type: "string",
			description:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
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
	describe: "List Buckets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name_contains: argv["name-contains"],
					start_after: argv["start-after"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					cursor: argv["cursor"],
				};

				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets`,
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
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/r2/buckets`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
