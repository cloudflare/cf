import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/logpush.ts
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
			"$0 logpush transformers versions list\n\nReturns version metadata for a transformer, newest first. Each version corresponds to a SQL query update."
		)
		.option("transformer-id", {
			type: "string",
			description: "The transformer ID.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of versions to return.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"get-accounts-account_id-logpush-transformers-transformer_id-versions">;
type Query =
	SdkQuery<"get-accounts-account_id-logpush-transformers-transformer_id-versions">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List transformer versions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush transformers versions list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf logpush transformers versions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logpush/transformers/${argv["transformer-id"] == null ? "<transformer-id>" : encodeURIComponent(String(argv["transformer-id"]))}/versions`,
						pathParams: {
							"transformer-id": String(argv["transformer-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.logpush.transformers.versions.list({
						account_id: accountId,
						transformer_id: argv["transformer-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
