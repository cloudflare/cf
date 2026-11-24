import operation from "../../../_operations/zero-trust/cws/deployments/create.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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
	command: "create",
	describe: "Create a new deployment",
	usage:
		"$0 zero-trust cws deployments create\n\nCreates a deployment with the specified policy sets, domain ACL, and basic-auth credentials.",
	flags: {
		"basic-auth-credential-ids": {
			kind: "parsed",
			brief: "IDs of basic-auth credentials to attach",
			variadic: true,
			optional: true,
			parse: String,
		},
		"default-mode": {
			kind: "parsed",
			brief: "Default traffic mode: ALLOW or BLOCK",
			optional: true,
			choices: ["ALLOW", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "default-mode", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Optional free-form description.",
			optional: true,
			parse: String,
		},
		"domain-acl-id": {
			kind: "parsed",
			brief: "ID of the domain ACL to attach (omit or null for none)",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the deployment",
			optional: true,
			parse: String,
		},
		"on-error-action": {
			kind: "parsed",
			brief: "Action for runtime Rego errors. Omit to use BLOCK.",
			default: "BLOCK",
			choices: ["BLOCK", "SKIP"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "on-error-action", "text"),
		},
		"policy-set-ids": {
			kind: "parsed",
			brief: "IDs of policy sets to attach",
			variadic: true,
			optional: true,
			parse: String,
		},
		"rego-raise-error": {
			kind: "boolean",
			brief:
				"Whether OPA builtin failures are raised as runtime evaluation errors. Omit to use the default true value.",
			default: true,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags to attach. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
				command: "zero-trust cws deployments create",
				classification: {
					safeFlags: [
						"default-mode",
						"on-error-action",
						"rego-raise-error",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["basic-auth-credential-ids"] === undefined) {
						throw new Error(
							"--basic-auth-credential-ids is required (or pass --body with this field set)."
						);
					}
					if (argv["default-mode"] === undefined) {
						argv["default-mode"] = await promptForRequiredEnumField(
							"default-mode",
							"Default traffic mode: ALLOW or BLOCK",
							["ALLOW", "BLOCK"] as const
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Name of the deployment"
						);
					}
					if (argv["policy-set-ids"] === undefined) {
						throw new Error(
							"--policy-set-ids is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws deployments create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/deployments`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											basic_auth_credential_ids:
												argv["basic-auth-credential-ids"],
											default_mode: argv["default-mode"],
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											domain_acl_id: resolveFileToken(
												argv["domain-acl-id"] as string | undefined,
												"domain-acl-id",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											on_error_action: argv["on-error-action"],
											policy_set_ids: argv["policy-set-ids"],
											rego_raise_error: argv["rego-raise-error"],
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
									),
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
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						basic_auth_credential_ids: argv["basic-auth-credential-ids"],
						default_mode: argv["default-mode"],
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						domain_acl_id: resolveFileToken(
							argv["domain-acl-id"] as string | undefined,
							"domain-acl-id",
							"text"
						),
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						on_error_action: argv["on-error-action"],
						policy_set_ids: argv["policy-set-ids"],
						rego_raise_error: argv["rego-raise-error"],
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
