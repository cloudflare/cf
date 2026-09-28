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
 * list-vectors command
 * @generated from apis/overlays/vectorize.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 vectorize list-vectors <index-name>\n\nReturns a paginated list of vector identifiers from the specified index."
		)
		.positional("index-name", {
			type: "string",
			description: "Index name",
			demandOption: true,
		})
		.option("count", {
			type: "number",
			description: "Maximum number of vectors to return",
		})
		.option("cursor", {
			type: "string",
			description: "Cursor for pagination to get the next page of results",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"vectorize-list-vectors">;
type Query = SdkQuery<"vectorize-list-vectors">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list-vectors <index-name>",
	describe: "List Vectors",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize list-vectors",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					count: argv["count"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize list-vectors",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/list`,
						pathParams: { "index-name": String(argv["index-name"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.vectorize.listVectors({
						account_id: accountId,
						index_name: argv["index-name"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
