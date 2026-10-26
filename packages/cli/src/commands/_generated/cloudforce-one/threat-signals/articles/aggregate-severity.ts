import operation from "../../../_operations/cloudforce-one/threat-signals/articles/aggregate-severity.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * aggregate-severity command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one threat-signals articles aggregate-severity\n\nBeta. Counts the account's Threat Signals articles in each intrinsic severity band. An article's band is the severity level nearest its severity, from informational to critical. Articles without a severity are not counted. min_relevance counts only articles at or above a relevance band for any active Priority Intelligence Requirement. Like the article severity field, severity is reported only while the account has an active Priority Intelligence Requirement, including one the matcher paused; otherwise every count is zero. All counts are read together and are exact."
		)
		.option("published-after", {
			type: "string",
			description:
				"Include articles published at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
		})
		.option("published-before", {
			type: "string",
			description:
				"Include articles published at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
		})
		.option("min-relevance", {
			type: "string",
			description:
				"Beta. Count only articles at or above this relevance band for any active Priority Intelligence Requirement, as the article list's min_relevance does without pir_id. Excludes articles that have not been scored against an active PIR.",
			choices: ["low", "medium", "high"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "aggregate-severity",
	describe: "Count Threat Signals articles by severity band",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals articles aggregate-severity",
				classification: {
					safeFlags: ["min-relevance", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					published_after: argv["published-after"],
					published_before: argv["published-before"],
					min_relevance: argv["min-relevance"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-signals articles aggregate-severity",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles/severity/aggregate`,
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
