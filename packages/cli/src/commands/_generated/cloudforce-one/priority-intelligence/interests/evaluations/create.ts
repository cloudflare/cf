import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one priority-intelligence interests evaluations create\n\nCompares the trailing event-date window with the preceding window. Results are precision-gated to enabled account interests. Late ingestion can cause an older event to appear in a later evaluation, so results describe changes in event-dated intelligence rather than exact adversary-activity timing."
		)
		.option("as-of", { type: "string", description: "The as_of field" })
		.option("candidate-limit", {
			type: "number",
			description: "The candidate_limit field",
		})
		.option("dataset-ids", {
			type: "string",
			array: true,
			description: "The dataset_ids field",
		})
		.option("emerging-min-current-count", {
			type: "number",
			description: "The emerging_min_current_count field",
		})
		.option("established-min-absolute-delta", {
			type: "number",
			description: "The established_min_absolute_delta field",
		})
		.option("established-min-prior-count", {
			type: "number",
			description: "The established_min_prior_count field",
		})
		.option("established-min-relative-delta", {
			type: "number",
			description: "The established_min_relative_delta field",
		})
		.option("window-days", {
			type: "number",
			description: "The window_days field",
			default: 7,
		})
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

type Request = SdkRequest<"post_PirInterestEvaluationCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Evaluate recent event-dated changes for account interests",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"cloudforce-one priority-intelligence interests evaluations create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one priority-intelligence interests evaluations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/interests/evaluations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										as_of: resolveFileToken(
											argv["as-of"] as string | undefined,
											"as-of",
											"text"
										),
										candidate_limit: argv["candidate-limit"],
										dataset_ids: argv["dataset-ids"],
										emerging_min_current_count:
											argv["emerging-min-current-count"],
										established_min_absolute_delta:
											argv["established-min-absolute-delta"],
										established_min_prior_count:
											argv["established-min-prior-count"],
										established_min_relative_delta:
											argv["established-min-relative-delta"],
										window_days: argv["window-days"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.priorityIntelligence.interests.evaluations.create(
							{ ...bodyData, account_id: accountId } satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					as_of: resolveFileToken(
						argv["as-of"] as string | undefined,
						"as-of",
						"text"
					),
					candidate_limit: argv["candidate-limit"],
					dataset_ids: argv["dataset-ids"],
					emerging_min_current_count: argv["emerging-min-current-count"],
					established_min_absolute_delta:
						argv["established-min-absolute-delta"],
					established_min_prior_count: argv["established-min-prior-count"],
					established_min_relative_delta:
						argv["established-min-relative-delta"],
					window_days: argv["window-days"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.priorityIntelligence.interests.evaluations.create(
						{ ...bodyData, account_id: accountId } satisfies Request
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
