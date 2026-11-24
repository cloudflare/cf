import operation from "../../../../_operations/zero-trust/cws/basic-auth-credentials/secrets/create.js";
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
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <credential-id>",
	describe: "Add a secret to a basic-auth credential",
	usage:
		"$0 zero-trust cws basic-auth-credentials secrets create <credential-id>\n\nAdds a password secret to the credential.",
	flags: {
		"expires-at": {
			kind: "parsed",
			brief:
				"Optional deactivation deadline (RFC 3339). Omit or null for no expiry.",
			optional: true,
			parse: String,
		},
		password: {
			kind: "parsed",
			brief:
				"Password stored only as a one-way hash and never returned. Maximum 72 UTF-8 bytes.",
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
	operands: [
		{
			placeholder: "credential-id",
			brief: "ID of the parent credential",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws basic-auth-credentials secrets create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["password"] === undefined) {
						argv["password"] = await promptForRequiredField(
							"password",
							"Password stored only as a one-way hash and never returned. Maximum 72 UTF-8 bytes.",
							{ kind: "secret" }
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws basic-auth-credentials secrets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/basic-auth-credentials/${argv["credential-id"] == null ? "<credential-id>" : encodeURIComponent(String(argv["credential-id"]))}/secrets`,
						pathParams: {
							"credential-id": String(argv["credential-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										password: resolveFileToken(
											argv["password"] as string | undefined,
											"password",
											"text"
										),
									}),
						sensitiveBodyPaths: [["password"]],
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
							credential_id: argv["credential-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					password: resolveFileToken(
						argv["password"] as string | undefined,
						"password",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						credential_id: argv["credential-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
