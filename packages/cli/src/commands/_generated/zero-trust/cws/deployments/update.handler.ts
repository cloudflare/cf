import operation from "../../../_operations/zero-trust/cws/deployments/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust cws deployments update",
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
					command: "cf zero-trust cws deployments update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/deployments/${argv["deployment-id"] == null ? "<deployment-id>" : encodeURIComponent(String(argv["deployment-id"]))}`,
					pathParams: { "deployment-id": String(argv["deployment-id"] ?? "") },
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
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					deployment_id: argv["deployment-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
