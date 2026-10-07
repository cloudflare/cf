import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/ai-search.ts
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
			"$0 ai-search jobs get <job-id>\n\nRetrieves details for a specific AI Search indexing job."
		)
		.positional("job-id", {
			type: "string",
			description: "Indexing job ID.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("instance-id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ai-search-namespace-instance-get-job">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <job-id>",
	describe: "Get a Job Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search jobs get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search jobs get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/jobs/${argv["job-id"] == null ? "<job-id>" : encodeURIComponent(String(argv["job-id"]))}`,
						pathParams: {
							"instance-id": String(argv["instance-id"] ?? ""),
							"job-id": String(argv["job-id"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.aiSearch.jobs.get({
						account_id: accountId,
						namespace: argv["namespace"],
						"instance-id": argv["instance-id"],
						job_id: argv["job-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
