import operation from "../../../_operations/zero-trust/cws/deployments/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust cws deployments update <deployment-id>\n\nReplaces the deployment's mutable configuration and resource attachments."
		)
		.positional("deployment-id", {
			type: "string",
			description: "ID of the deployment to update",
			demandOption: true,
		})
		.option("basic-auth-credential-ids", {
			type: "string",
			array: true,
			description: "Replacement set of basic-auth credential IDs",
		})
		.option("default-mode", {
			type: "string",
			description: "Default traffic mode: ALLOW or BLOCK",
			choices: ["ALLOW", "BLOCK"],
		})
		.coerce("default-mode", (value) =>
			resolveFileToken(value, "default-mode", "text")
		)
		.option("description", {
			type: "string",
			description: "Optional free-form description.",
		})
		.option("domain-acl-id", {
			type: "string",
			description: "ID of the domain ACL to attach (omit or null to clear)",
		})
		.option("name", { type: "string", description: "Name of the deployment" })
		.option("on-error-action", {
			type: "string",
			description:
				"Action for runtime Rego errors. Omit to preserve the current value.",
			choices: ["BLOCK", "SKIP"],
		})
		.coerce("on-error-action", (value) =>
			resolveFileToken(value, "on-error-action", "text")
		)
		.option("policy-set-ids", {
			type: "string",
			array: true,
			description: "Replacement set of policy set IDs",
		})
		.option("rego-raise-error", {
			type: "boolean",
			description:
				"Whether OPA builtin failures are raised as runtime evaluation errors. Omit to preserve the current value.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <deployment-id>",
	describe: "Update a deployment",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws deployments update",
				classification: {
					safeFlags: [
						"default-mode",
						"on-error-action",
						"rego-raise-error",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws deployments update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/deployments/${argv["deployment-id"] == null ? "<deployment-id>" : encodeURIComponent(String(argv["deployment-id"]))}`,
						pathParams: {
							"deployment-id": String(argv["deployment-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							deployment_id: argv["deployment-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						deployment_id: argv["deployment-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
