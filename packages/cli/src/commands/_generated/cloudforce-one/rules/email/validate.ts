import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * validate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one rules email validate\n\nValidates structured email rule syntax and metadata."
		)
		.option("condition-operator", {
			type: "string",
			description: "The condition.operator field",
			choices: ["and", "or"],
		})
		.option("condition-type", {
			type: "string",
			description: "The condition.type field",
			choices: ["group"],
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("enabled", {
			type: "boolean",
			description: "The enabled field",
			default: true,
		})
		.option("existing-rule-id", {
			type: "string",
			description:
				"Existing rule ID to exclude from duplicate-name checks when validating an update.",
		})
		.option("meta", {
			type: "string",
			description:
				"The meta field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("status", {
			type: "string",
			description:
				"Disposition for matching email. This emits status metadata with the selected value.",
			choices: ["silent", "blocking"],
			default: "silent",
		})
		.option("strings", {
			type: "string",
			description:
				"The strings field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"cloudforce-one-validate-email-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "validate",
	describe: "Validate an email rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules email validate",
				classification: {
					safeFlags: [
						"condition-operator",
						"condition-type",
						"enabled",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules email validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/structured/validate`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										condition: {
											operator: resolveFileToken(
												argv["condition-operator"] as string | undefined,
												"condition-operator",
												"text"
											),
											type: resolveFileToken(
												argv["condition-type"] as string | undefined,
												"condition-type",
												"text"
											),
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										existing_rule_id: resolveFileToken(
											argv["existing-rule-id"] as string | undefined,
											"existing-rule-id",
											"text"
										),
										meta: parseObjectArray(argv["meta"], "meta"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										status: resolveFileToken(
											argv["status"] as string | undefined,
											"status",
											"text"
										),
										strings: parseObjectArray(argv["strings"], "strings"),
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
						client.cloudforceOne.rules.email.validate({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["condition-operator"] === undefined) {
					argv["condition-operator"] = await promptForRequiredEnumField(
						"condition-operator",
						"The condition.operator field",
						["and", "or"] as const
					);
				}
				if (argv["condition-type"] === undefined) {
					argv["condition-type"] = await promptForRequiredEnumField(
						"condition-type",
						"The condition.type field",
						["group"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					condition: {
						operator: resolveFileToken(
							argv["condition-operator"] as string | undefined,
							"condition-operator",
							"text"
						),
						type: resolveFileToken(
							argv["condition-type"] as string | undefined,
							"condition-type",
							"text"
						),
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					existing_rule_id: resolveFileToken(
						argv["existing-rule-id"] as string | undefined,
						"existing-rule-id",
						"text"
					),
					meta: parseObjectArray(argv["meta"], "meta"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					status: resolveFileToken(
						argv["status"] as string | undefined,
						"status",
						"text"
					),
					strings: parseObjectArray(argv["strings"], "strings"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.rules.email.validate({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
