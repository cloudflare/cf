import operation from "../../_operations/email-security/sending-domain-restrictions/create.js";
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
	describe: "Create a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions create\n\nCreates a new sending domain restriction to enforce TLS requirements for a domain. Emails without TLS from this domain will be dropped unless the subdomain is in the exclude list.",
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "Domain that requires TLS enforcement.",
			optional: true,
			parse: String,
		},
		exclude: {
			kind: "parsed",
			brief: "Subdomains to exempt from TLS requirements.",
			variadic: true,
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
			brief: "Create a sending domain restriction.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security sending-domain-restrictions create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["domain"] === undefined) {
						argv["domain"] = await promptForRequiredField(
							"domain",
							"Domain that requires TLS enforcement."
						);
					}
					if (argv["exclude"] === undefined) {
						throw new Error(
							"--exclude is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security sending-domain-restrictions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/sending_domain_restrictions`,
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
										domain: resolveFileToken(
											argv["domain"] as string | undefined,
											"domain",
											"text"
										),
										exclude: argv["exclude"],
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
					domain: resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					),
					exclude: argv["exclude"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
