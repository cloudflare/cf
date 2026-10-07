import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * occurrences command
 * @generated from apis/overlays/o11y.ts
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
			"$0 o11y issues occurrences <issueId>\n\nList the retained error occurrences grouped into an issue, newest first."
		)
		.positional("issue-id", {
			type: "string",
			description: "Issue ID returned by the issues API.",
			demandOption: true,
		})
		.option("cursor", {
			type: "string",
			description: "Opaque cursor returned in result_info.cursors.after.",
		})
		.option("per-page", { type: "number", description: "Per page" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"issues.occurrences.list">;
type Query = SdkQuery<"issues.occurrences.list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "occurrences <issueId>",
	describe: "List issue occurrences",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y issues occurrences",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y issues occurrences",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/issues/${argv["issue-id"] == null ? "<issue-id>" : encodeURIComponent(String(argv["issue-id"]))}/occurrences`,
						pathParams: { "issue-id": String(argv["issue-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.observability.issues.occurrences({
						account_id: accountId,
						issueId: argv["issue-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
