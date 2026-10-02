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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events dataset permissions create <dataset-id>\n\nCreate a permission"
		)
		.positional("dataset-id", {
			type: "string",
			description: "Dataset UUID.",
			demandOption: true,
		})
		.option("role", {
			type: "string",
			description: "The role field",
			choices: ["read", "write"],
		})
		.option("subject-id", {
			type: "string",
			description: "The subjectId field",
		})
		.option("subject-type", {
			type: "string",
			description: "The subjectType field",
			choices: ["account", "group"],
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

type Request = SdkRequest<"post_PermissionCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <dataset-id>",
	describe: "Create a permission for dataset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events dataset permissions create",
				classification: {
					safeFlags: ["role", "subject-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events dataset permissions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/permissions`,
						pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										role: resolveFileToken(
											argv["role"] as string | undefined,
											"role",
											"text"
										),
										subjectId: resolveFileToken(
											argv["subject-id"] as string | undefined,
											"subject-id",
											"text"
										),
										subjectType: resolveFileToken(
											argv["subject-type"] as string | undefined,
											"subject-type",
											"text"
										),
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
						client.cloudforceOne.events.dataset.permissions.create({
							...bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["role"] === undefined) {
					argv["role"] = await promptForRequiredEnumField(
						"role",
						"The role field",
						["read", "write"] as const
					);
				}
				if (argv["subject-id"] === undefined) {
					argv["subject-id"] = await promptForRequiredField(
						"subject-id",
						"The subjectId field"
					);
				}
				if (argv["subject-type"] === undefined) {
					argv["subject-type"] = await promptForRequiredEnumField(
						"subject-type",
						"The subjectType field",
						["account", "group"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					role: resolveFileToken(
						argv["role"] as string | undefined,
						"role",
						"text"
					),
					subjectId: resolveFileToken(
						argv["subject-id"] as string | undefined,
						"subject-id",
						"text"
					),
					subjectType: resolveFileToken(
						argv["subject-type"] as string | undefined,
						"subject-type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.dataset.permissions.create({
						...bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
