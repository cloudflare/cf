import operation from "../../_operations/workflows/instances/pause.js";
/**
 * pause command
 * @generated from apis/overlays/workflows.ts
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "pause <instance-id>",
	describe: "Change status of instance",
	usage:
		"$0 workflows instances pause <instance-id>\n\nChanges the execution status of a workflow instance (e.g., pause, resume, terminate).",
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		status: {
			kind: "parsed",
			brief: "The status field",
			optional: true,
			choices: ["pause", "resume", "terminate", "restart"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		rollback: {
			kind: "boolean",
			brief: "Run rollback before terminating.",
			optional: true,
		},
		"from-count": {
			kind: "parsed",
			brief: "The from.count field",
			optional: true,
			parse: Number,
		},
		"from-name": {
			kind: "parsed",
			brief: "The from.name field",
			optional: true,
			parse: String,
		},
		"from-type": {
			kind: "parsed",
			brief: "The from.type field",
			optional: true,
			choices: ["do", "sleep", "waitForEvent"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "from-type", "text"),
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
	operands: [
		{
			placeholder: "instance-id",
			brief:
				"Instance identifier. User-created instances match \`^[a-zA-Z0-9_][a-zA-Z0-9-_]*$\` (max 100 characters); cron-triggered instances can use a longer, system-generated id derived from the cron expression.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("rollback", ["from-count", "from-name", "from-type"]);
		rules.conflicts("from-count", ["rollback"]);
		rules.implies("from-count", ["from-name"]);
		rules.conflicts("from-name", ["rollback"]);
		rules.conflicts("from-type", ["rollback"]);
		rules.implies("from-type", ["from-name"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances pause",
				classification: {
					safeFlags: ["status", "rollback", "from-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["status"] === undefined) {
						argv["status"] = await promptForRequiredEnumField(
							"status",
							"The status field",
							["pause", "resume", "terminate", "restart"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances pause",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/status`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										status: argv["status"],
										rollback: argv["rollback"],
										from: {
											count: argv["from-count"],
											name: resolveFileToken(
												argv["from-name"] as string | undefined,
												"from-name",
												"text"
											),
											type: argv["from-type"],
										},
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							workflow_name: argv["workflow-name"],
							instance_id: argv["instance-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					status: argv["status"],
					rollback: argv["rollback"],
					from: {
						count: argv["from-count"],
						name: resolveFileToken(
							argv["from-name"] as string | undefined,
							"from-name",
							"text"
						),
						type: argv["from-type"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						workflow_name: argv["workflow-name"],
						instance_id: argv["instance-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
