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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/rules.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 rules lists items list\n\nFetches all the items in the list.")
		.option("list-id", {
			type: "string",
			description: "The unique ID of the list.",
			demandOption: true,
		})
		.option("cursor", {
			type: "string",
			description:
				"The pagination cursor. An opaque string token that indicates where to continue when requesting the next/previous set of records. The response provides cursor values under `result_info.cursors`. You should make no assumptions about a cursor's content or length.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Amount of results to include in each paginated response. A non-negative 32 bit integer.",
		})
		.option("search", {
			type: "string",
			description:
				"A search query to filter returned items. Its meaning depends on the list type: IP addresses must start with the provided string, hostnames and bulk redirects must contain the string, and ASNs must match the string exactly.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"lists-get-list-items">;
type Query = SdkQuery<"lists-get-list-items">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Get list items",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rules lists items list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.rules.lists.items.list({
						account_id: accountId,
						list_id: argv["list-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
