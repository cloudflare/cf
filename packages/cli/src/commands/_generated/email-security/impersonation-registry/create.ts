import operation from "../../_operations/email-security/impersonation-registry/create.js";
/**
 * create command
 * @generated from apis/overlays/email-security.ts
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
	command: "create",
	describe: "Create impersonation registry entry",
	usage:
		"$0 email-security impersonation-registry create\n\nCreates a new entry in the impersonation registry to protect against impersonation. Emails attempting to impersonate this identity will be flagged. Supports regex patterns for flexible email matching.",
	flags: {
		comments: {
			kind: "parsed",
			brief: "Optional note describing the entry.",
			optional: true,
			parse: String,
		},
		"directory-id": {
			kind: "parsed",
			brief:
				"Identifier of the directory the entry was synced from, when directory-synced.",
			optional: true,
			parse: Number,
		},
		"directory-node-id": {
			kind: "parsed",
			brief:
				"Identifier of the directory node the entry was synced from, when directory-synced.",
			optional: true,
			parse: Number,
		},
		email: {
			kind: "parsed",
			brief: "Email address (or pattern) of the protected identity.",
			optional: true,
			parse: String,
		},
		"external-directory-node-id": {
			kind: "parsed",
			brief: "Deprecated. External identifier of the directory node.",
			optional: true,
			parse: String,
		},
		"is-email-regex": {
			kind: "boolean",
			brief:
				"Whether `email` is a regular expression instead of a literal address.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Display name of the protected identity.",
			optional: true,
			parse: String,
		},
		provenance: {
			kind: "parsed",
			brief: "Source the entry was created from.",
			optional: true,
			choices: [
				"A1S_INTERNAL",
				"SNOOPY-CASB_OFFICE_365",
				"SNOOPY-OFFICE_365",
				"SNOOPY-GOOGLE_DIRECTORY",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "provenance", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Create an impersonation registry entry.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security impersonation-registry create",
				classification: {
					safeFlags: ["is-email-regex", "provenance", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["email"] === undefined) {
						argv["email"] = await promptForRequiredField(
							"email",
							"Email address (or pattern) of the protected identity."
						);
					}
					if (argv["is-email-regex"] === undefined) {
						throw new Error(
							"--is-email-regex is required (or pass --body with this field set)."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Display name of the protected identity."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security impersonation-registry create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/impersonation_registry`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comments: resolveFileToken(
											argv["comments"] as string | undefined,
											"comments",
											"text"
										),
										directory_id: argv["directory-id"],
										directory_node_id: argv["directory-node-id"],
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										external_directory_node_id: resolveFileToken(
											argv["external-directory-node-id"] as string | undefined,
											"external-directory-node-id",
											"text"
										),
										is_email_regex: argv["is-email-regex"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										provenance: argv["provenance"],
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					directory_id: argv["directory-id"],
					directory_node_id: argv["directory-node-id"],
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					external_directory_node_id: resolveFileToken(
						argv["external-directory-node-id"] as string | undefined,
						"external-directory-node-id",
						"text"
					),
					is_email_regex: argv["is-email-regex"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					provenance: argv["provenance"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
