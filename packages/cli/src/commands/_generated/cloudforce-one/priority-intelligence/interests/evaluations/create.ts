import operation from "../../../../_operations/cloudforce-one/priority-intelligence/interests/evaluations/create.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Evaluate recent event-dated changes for account interests",
	usage:
		"$0 cloudforce-one priority-intelligence interests evaluations create\n\nCompares the trailing event-date window with the preceding window. Results are precision-gated to enabled account interests. Late ingestion can cause an older event to appear in a later evaluation, so results describe changes in event-dated intelligence rather than exact adversary-activity timing.",
	flags: {
		"as-of": {
			kind: "parsed",
			brief: "The as_of field",
			optional: true,
			parse: String,
		},
		"candidate-limit": {
			kind: "parsed",
			brief: "The candidate_limit field",
			optional: true,
			parse: Number,
		},
		"dataset-ids": {
			kind: "parsed",
			brief: "The dataset_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"emerging-min-current-count": {
			kind: "parsed",
			brief: "The emerging_min_current_count field",
			optional: true,
			parse: Number,
		},
		"established-min-absolute-delta": {
			kind: "parsed",
			brief: "The established_min_absolute_delta field",
			optional: true,
			parse: Number,
		},
		"established-min-prior-count": {
			kind: "parsed",
			brief: "The established_min_prior_count field",
			optional: true,
			parse: Number,
		},
		"established-min-relative-delta": {
			kind: "parsed",
			brief: "The established_min_relative_delta field",
			optional: true,
			parse: Number,
		},
		"window-days": {
			kind: "parsed",
			brief: "The window_days field",
			default: "7",
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"cloudforce-one priority-intelligence interests evaluations create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
