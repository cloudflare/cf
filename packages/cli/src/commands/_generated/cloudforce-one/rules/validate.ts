import operation from "../../_operations/cloudforce-one/rules/validate.js";
/**
 * validate command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "validate",
	describe: "Validate rule with context",
	usage:
		"$0 cloudforce-one rules validate\n\nValidates rule syntax, name uniqueness, namespace, and metadata.",
	flags: {
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		"exclude-rule-id": {
			kind: "parsed",
			brief: "The excludeRuleId field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		namespaces: {
			kind: "parsed",
			brief: "The namespaces field",
			variadic: true,
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief: "The path field",
			optional: true,
			parse: String,
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
				command: "cloudforce-one rules validate",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["content"] === undefined) {
						argv["content"] = await promptForRequiredField(
							"content",
							"The content field"
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/validate`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										content: resolveFileToken(
											argv["content"] as string | undefined,
											"content",
											"text"
										),
										excludeRuleId: resolveFileToken(
											argv["exclude-rule-id"] as string | undefined,
											"exclude-rule-id",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										namespaces: argv["namespaces"],
										path: resolveFileToken(
											argv["path"] as string | undefined,
											"path",
											"text"
										),
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
					const result = await withProgress(`Validating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Validated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					content: resolveFileToken(
						argv["content"] as string | undefined,
						"content",
						"text"
					),
					excludeRuleId: resolveFileToken(
						argv["exclude-rule-id"] as string | undefined,
						"exclude-rule-id",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					namespaces: argv["namespaces"],
					path: resolveFileToken(
						argv["path"] as string | undefined,
						"path",
						"text"
					),
				});
				const result = await withProgress(`Validating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Validated` });
			}
		),
});

export default command;
