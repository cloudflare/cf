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
 * @generated from apis/overlays/kv.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 kv keys list\n\nLists key names in the specified Workers KV namespace, with expiration times and metadata when present. Use `prefix` to filter names and `cursor` to request the next page. Values are not included."
		)
		.option("namespace-id", {
			type: "string",
			description: "ID of the Workers KV namespace.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of keys to return in one response. Pass `result_info.cursor` from the response as `cursor` to request the next page.",
		})
		.option("prefix", {
			type: "string",
			description:
				"Filters returned keys by a name prefix. Exact matches and any key names that begin with the prefix will be returned.",
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque pagination token from `result_info.cursor` in the previous response. Pass it unchanged to request the next page of keys.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"workers-kv-namespace-list-a-namespace'-s-keys">;
type Query = SdkQuery<"workers-kv-namespace-list-a-namespace'-s-keys">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List keys in a namespace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv keys list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					prefix: argv["prefix"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv keys list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/keys`,
						pathParams: { "namespace-id": String(argv["namespace-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.kv.keys.list({
						account_id: accountId,
						namespace_id: argv["namespace-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
