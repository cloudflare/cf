import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * dismiss command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel attack-surface-report issues dismiss <issue-id>\n\nDeprecated endpoint for archiving Security Center insights. Use the newer archive-security-center-insight endpoint instead."
		)
		.positional("issue-id", {
			type: "string",
			description: "Issue ID",
			demandOption: true,
		})
		.option("dismiss", { type: "boolean", description: "The dismiss field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"archive-security-center-insight-deprecated">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "dismiss <issue-id>",
	describe: "Archives Security Center Insight",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel attack-surface-report issues dismiss",
				classification: {
					safeFlags: ["dismiss", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel attack-surface-report issues dismiss",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/attack-surface-report/issues/${argv["issue-id"] == null ? "<issue-id>" : encodeURIComponent(String(argv["issue-id"]))}/dismiss`,
						pathParams: { "issue-id": String(argv["issue-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dismiss: argv["dismiss"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.intel.attackSurfaceReport.issues.dismiss({
							...bodyData,
							account_id: accountId,
							issue_id: argv["issue-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					dismiss: argv["dismiss"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.intel.attackSurfaceReport.issues.dismiss({
						...bodyData,
						account_id: accountId,
						issue_id: argv["issue-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
