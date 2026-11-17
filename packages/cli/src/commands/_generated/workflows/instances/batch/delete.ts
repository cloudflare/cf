import operation from "../../../_operations/workflows/instances/batch/delete.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * delete command
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workflows instances batch delete <workflow-name>\n\nDeletes multiple workflow instances in a single batch operation."
		)
		.positional("workflow-name", {
			type: "string",
			description: "Workflow name",
			demandOption: true,
		})
		.option("instances", {
			type: "string",
			array: true,
			description: "The instances field",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <workflow-name>",
	describe: "Batch delete instances of a workflow",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances batch delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined) {
					if (argv["instances"] === undefined) {
						throw new Error(
							"--instances is required (or pass --body with this field set)."
						);
					}
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances batch delete",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances/batch/delete`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										instances: argv["instances"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation permanently deletes the Workflow instances.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Processing`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							workflow_name: argv["workflow-name"],
						})
					);
					formatOutput(result, { successLabel: `Done` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					instances: argv["instances"],
				});
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						workflow_name: argv["workflow-name"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
};

export default command;
