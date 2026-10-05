import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/builds.ts
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
			"$0 builds repos config-autofill get <repo-id>\n\nAnalyze repository for automatic configuration detection"
		)
		.positional("repo-id", {
			type: "string",
			description: "Provider-specific repository identifier.",
			demandOption: true,
		})
		.option("provider-type", {
			type: "string",
			description: "SCM provider type",
			demandOption: true,
		})
		.option("provider-account-id", {
			type: "string",
			description:
				"Provider-specific identifier of the account or namespace that owns the repository.",
			demandOption: true,
		})
		.option("branch", {
			type: "string",
			description: "Git branch name.",
			demandOption: true,
		})
		.option("root-directory", {
			type: "string",
			description:
				"Repository directory in which build and deploy commands run.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"getWorkerConfigAutofill">;
type Query = SdkQuery<"getWorkerConfigAutofill">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <repo-id>",
	describe: "Get repository configuration autofill",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds repos config-autofill get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					branch: argv["branch"],
					root_directory: argv["root-directory"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds repos config-autofill get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/repos/${argv["provider-type"] == null ? "<provider-type>" : encodeURIComponent(String(argv["provider-type"]))}/${argv["provider-account-id"] == null ? "<provider-account-id>" : encodeURIComponent(String(argv["provider-account-id"]))}/${argv["repo-id"] == null ? "<repo-id>" : encodeURIComponent(String(argv["repo-id"]))}/config_autofill`,
						pathParams: {
							"provider-type": String(argv["provider-type"] ?? ""),
							"provider-account-id": String(argv["provider-account-id"] ?? ""),
							"repo-id": String(argv["repo-id"] ?? ""),
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
					client.builds.repos.configAutofill.get({
						account_id: accountId,
						provider_type: argv["provider-type"],
						provider_account_id: argv["provider-account-id"],
						repo_id: argv["repo-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
