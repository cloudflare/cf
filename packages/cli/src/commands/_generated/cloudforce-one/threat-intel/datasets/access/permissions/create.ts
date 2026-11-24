import operation from "../../../../../_operations/cloudforce-one/threat-intel/datasets/access/permissions/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <dataset-id>",
	describe: "Grant access to a dataset",
	usage:
		"$0 cloudforce-one threat-intel datasets access permissions create <dataset-id>\n\nGives an account or account group (`subjectType` and `subjectId`) `read` or `write` access to a dataset.",
	flags: {
		role: {
			kind: "parsed",
			brief: "The role field",
			optional: true,
			choices: ["read", "write"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "role", "text"),
		},
		"subject-id": {
			kind: "parsed",
			brief: "The subjectId field",
			optional: true,
			parse: String,
		},
		"subject-type": {
			kind: "parsed",
			brief: "The subjectType field",
			optional: true,
			choices: ["account", "group"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "subject-type", "text"),
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
		{ placeholder: "dataset-id", brief: "Dataset UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"cloudforce-one threat-intel datasets access permissions create",
				classification: {
					safeFlags: ["role", "subject-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-intel datasets access permissions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/permissions`,
						pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										role: argv["role"],
										subjectId: resolveFileToken(
											argv["subject-id"] as string | undefined,
											"subject-id",
											"text"
										),
										subjectType: argv["subject-type"],
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					role: argv["role"],
					subjectId: resolveFileToken(
						argv["subject-id"] as string | undefined,
						"subject-id",
						"text"
					),
					subjectType: argv["subject-type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
