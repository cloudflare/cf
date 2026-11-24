import operation from "../../_operations/iam/sso/create.js";
/**
 * create command
 * @generated from apis/overlays/iam.ts
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
	describe: "Initialize new SSO connector",
	usage:
		"$0 iam sso create\n\nCreates a new SSO connector for logging into Cloudflare through an identity provider.",
	flags: {
		"begin-verification": {
			kind: "boolean",
			brief: "Begin the verification process after creation",
			default: true,
		},
		"email-domain": {
			kind: "parsed",
			brief: "Email domain of the new SSO connector",
			optional: true,
			parse: String,
		},
		"use-fedramp-language": {
			kind: "boolean",
			brief:
				"Controls the display of FedRAMP language to the user during SSO login",
			default: false,
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
				command: "iam sso create",
				classification: {
					safeFlags: ["begin-verification", "use-fedramp-language", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["email-domain"] === undefined) {
						argv["email-domain"] = await promptForRequiredField(
							"email-domain",
							"Email domain of the new SSO connector"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam sso create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/sso_connectors`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										begin_verification: argv["begin-verification"],
										email_domain: resolveFileToken(
											argv["email-domain"] as string | undefined,
											"email-domain",
											"text"
										),
										use_fedramp_language: argv["use-fedramp-language"],
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
					begin_verification: argv["begin-verification"],
					email_domain: resolveFileToken(
						argv["email-domain"] as string | undefined,
						"email-domain",
						"text"
					),
					use_fedramp_language: argv["use-fedramp-language"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
