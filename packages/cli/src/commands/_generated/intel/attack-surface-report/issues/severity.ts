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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * severity command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel attack-surface-report issues severity\n\nRetrieves Security Center issue counts aggregated by severity level."
		)
		.option("dismissed", { type: "boolean", description: "Dismissed" })
		.option("issue-class", { type: "string", description: "Issue class" })
		.option("issue-type", { type: "string", description: "Issue type" })
		.option("product", { type: "string", description: "Product" })
		.option("source", { type: "string", description: "Source" })
		.option("severity", { type: "string", description: "Severity" })
		.option("subject", { type: "string", description: "Subject" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get-security-center-issue-counts-by-severity">;
type Query = SdkQuery<"get-security-center-issue-counts-by-severity">;

const typedBuilder = withArgTypes<
	{
		"issue-type": Query["issue_type"];
		source: Query["source"];
		severity: Query["severity"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "severity",
	describe: "Retrieves Security Center Issue Counts by Severity",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel attack-surface-report issues severity",
				classification: {
					safeFlags: ["dismissed", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					dismissed: argv["dismissed"],
					issue_class: argv["issue-class"],
					issue_type: argv["issue-type"],
					product: argv["product"],
					source: argv["source"],
					severity: argv["severity"],
					subject: argv["subject"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel attack-surface-report issues severity",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/attack-surface-report/issues/severity`,
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
					client.intel.attackSurfaceReport.issues.severity({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
