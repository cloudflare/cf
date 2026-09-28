import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/workflows.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workflows instances batch create <workflow-name>\n\nCreates multiple workflow instances in a single batch operation."
		)
		.positional("workflow-name", {
			type: "string",
			description: "Workflow name",
			demandOption: true,
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

type Request = SdkRequest<"wor-batch-create-workflow-instance">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <workflow-name>",
	describe: "Batch create new Workflow instances",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances batch create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances batch create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances/batch`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					if (Array.isArray(bodyData) && bodyData.length > 100) {
						const total = Math.ceil(bodyData.length / 100);
						let result: unknown = null;
						for (let i = 0; i < bodyData.length; i += 100) {
							const batch = bodyData.slice(i, i + 100);
							const batchNum = Math.floor(i / 100) + 1;
							result = await withProgress(
								`Creating: batch ${batchNum}/${total}`,
								async () =>
									requestApi<unknown>(
										client,
										"POST",
										`/accounts/${accountId}/workflows/${encodeURIComponent(String(argv["workflow-name"]))}/instances/batch`,
										{ body: batch }
									)
							);
						}
						formatOutput(result, { successLabel: `Created` });
						return;
					}
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/workflows/${encodeURIComponent(String(argv["workflow-name"]))}/instances/batch`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
