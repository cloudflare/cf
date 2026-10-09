import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * resume command
 * @generated from apis/overlays/workflows.ts
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workflows instances resume <instance-id>\n\nChanges the execution status of a workflow instance (e.g., pause, resume, terminate)."
		)
		.positional("instance-id", {
			type: "string",
			description:
				"Instance identifier. User-created instances match \`^[a-zA-Z0-9_][a-zA-Z0-9-_]*$\` (max 100 characters); cron-triggered instances can use a longer, system-generated id derived from the cron expression.",
			demandOption: true,
		})
		.option("workflow-name", {
			type: "string",
			description: "Workflow name",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description: "The status field",
			choices: ["pause", "resume", "terminate", "restart"],
		})
		.coerce("status", (value: string | undefined) =>
			resolveFileToken(value, "status", "text")
		)
		.option("rollback", {
			type: "boolean",
			description: "Run rollback before terminating.",
		})
		.option("from-count", {
			type: "number",
			description: "The from.count field",
		})
		.option("from-name", { type: "string", description: "The from.name field" })
		.option("from-type", {
			type: "string",
			description: "The from.type field",
			choices: ["do", "sleep", "waitForEvent"],
		})
		.coerce("from-type", (value: string | undefined) =>
			resolveFileToken(value, "from-type", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("rollback", ["from-count", "from-name", "from-type"])
		.conflicts("from-count", ["rollback"])
		.conflicts("from-name", ["rollback"])
		.conflicts("from-type", ["rollback"])
		.check((argv) => {
			const groupSet = ["from-count", "from-name", "from-type"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const requiredConflicts: Record<string, string[]> = {
					"from-name": ["rollback"],
				};
				const missing = ["from-name"].filter(
					(k) =>
						argv[k] === undefined &&
						!(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined)
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --from-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"wor-change-status-workflow-instance">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "resume <instance-id>",
	describe: "Change status of instance",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances resume",
				classification: {
					safeFlags: ["status", "rollback", "from-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances resume",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.workflows.instances.status.edit({
							body: bodyData,
							account_id: accountId,
							workflow_name: argv["workflow-name"],
							instance_id: argv["instance-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["status"] === undefined) {
					argv["status"] = await promptForRequiredEnumField(
						"status",
						"The status field",
						["pause", "resume", "terminate", "restart"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.workflows.instances.status.edit({
						body: bodyData,
						account_id: accountId,
						workflow_name: argv["workflow-name"],
						instance_id: argv["instance-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
