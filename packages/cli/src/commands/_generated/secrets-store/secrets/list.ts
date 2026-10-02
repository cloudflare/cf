import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/secrets-store.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 secrets-store secrets list\n\nLists all store secrets.")
		.option("store-id", {
			type: "string",
			description: "Store identifier.",
			demandOption: true,
		})
		.option("direction", {
			type: "string",
			description: "Direction to sort objects.",
			choices: ["asc", "desc"],
		})
		.option("page", { type: "number", description: "Page number." })
		.option("per-page", {
			type: "number",
			description: "Number of objects to return per page.",
		})
		.option("search", {
			type: "string",
			description:
				"Search secrets using a filter string, filtering across name and comment.",
		})
		.option("order", {
			type: "string",
			description: "Order secrets by values in the given field.",
			choices: ["name", "comment", "created", "modified", "status"],
		})
		.option("scopes", {
			type: "string",
			description: "Only secrets with the given scopes will be returned.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"secrets-store-secrets-list">;
type Query = SdkQuery<"secrets-store-secrets-list">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		order: Query["order"];
		scopes: Query["scopes"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List store secrets",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "secrets-store secrets list",
				classification: {
					safeFlags: ["direction", "order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					order: argv["order"],
					scopes: argv["scopes"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf secrets-store secrets list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secrets_store/stores/${argv["store-id"] == null ? "<store-id>" : encodeURIComponent(String(argv["store-id"]))}/secrets`,
						pathParams: { "store-id": String(argv["store-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.secretsStore.secrets.list({
						account_id: accountId,
						store_id: argv["store-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
