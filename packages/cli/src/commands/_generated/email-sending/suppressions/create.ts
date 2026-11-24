import operation from "../../_operations/email-sending/suppressions/create.js";
/**
 * create command
 * @generated from apis/overlays/email-sending.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["scope"],
		selector: "type",
		variants: [
			{
				values: ["account"],
				schema: {
					type: "object",
					properties: { type: { enum: ["account"] } },
					required: ["type"],
					additionalProperties: false,
				},
			},
			{
				values: ["sending_domain"],
				schema: {
					type: "object",
					properties: {
						type: { enum: ["sending_domain"] },
						value: { type: "string" },
					},
					required: ["type", "value"],
					additionalProperties: false,
				},
			},
		],
	},
];

const command = apiCommand({
	command: "create",
	describe: "Create account Email Sending suppression",
	usage:
		"$0 email-sending suppressions create\n\nCreates a suppression for every sending domain of the account (default) or for one sending domain (`scope.type = sending_domain`). Creating an existing active suppression returns its identifier.",
	flags: {
		email: {
			kind: "parsed",
			brief: "The email address to suppress.",
			optional: true,
			parse: String,
		},
		"expires-at": {
			kind: "parsed",
			brief:
				"Expiration timestamp for the suppression. Omit or set to null for a permanent suppression that never expires.",
			optional: true,
			parse: String,
		},
		note: {
			kind: "parsed",
			brief:
				"Advisory note for this suppression. Not enforced or validated beyond length.",
			optional: true,
			parse: String,
		},
		"scope-type": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `account`: Blocks the recipient for every sending domain of the account.\n- `sending_domain`: Blocks the recipient only for mail whose envelope MAIL FROM uses `value`.",
			optional: true,
			choices: ["account", "sending_domain"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope-type", "text"),
		},
		"scope-value": {
			kind: "parsed",
			brief:
				"The sending domain to suppress for: the domain part of the envelope MAIL FROM. It is lowercased and trailing dots are removed. Internationalized domains must use the ASCII (punycode) form. Ownership is not checked; a domain the account does not send from never matches.",
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["scope-type", "scope-value"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["scope-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --scope-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending suppressions create",
				classification: {
					safeFlags: ["scope-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["email"] === undefined) {
						argv["email"] = await promptForRequiredField(
							"email",
							"The email address to suppress."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-sending suppressions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: validateBodyUnions(
										compactBody({
											email: resolveFileToken(
												argv["email"] as string | undefined,
												"email",
												"text"
											),
											expires_at: resolveFileToken(
												argv["expires-at"] as string | undefined,
												"expires-at",
												"text"
											),
											note: resolveFileToken(
												argv["note"] as string | undefined,
												"note",
												"text"
											),
											scope: {
												type: argv["scope-type"],
												value: resolveFileToken(
													argv["scope-value"] as string | undefined,
													"scope-value",
													"text"
												),
											},
										}),
										bodyUnions
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
				const bodyData = compactBody({
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					note: resolveFileToken(
						argv["note"] as string | undefined,
						"note",
						"text"
					),
					scope: {
						type: argv["scope-type"],
						value: resolveFileToken(
							argv["scope-value"] as string | undefined,
							"scope-value",
							"text"
						),
					},
				});
				validateBodyUnions(bodyData, bodyUnions);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
