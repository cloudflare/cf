import operation from "../_operations/email-sending/send.js";
/**
 * send command
 * @generated from apis/overlays/email-sending.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "send",
	describe: "Send an email",
	usage:
		"$0 email-sending send\n\nSend an email for the specified account using the structured builder. Provide the sender, recipients, subject, and at least one of text or html; attachments are optional.",
	flags: {
		attachments: {
			kind: "parsed",
			brief:
				'File attachments and inline images. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"content": string, "content_id": string, "disposition": "inline", "filename": string, "type": string} | {"content": string, "disposition": "attachment", "filename": string, "type": string})].',
			optional: true,
			parse: String,
		},
		"bcc-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"bcc-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		"cc-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"cc-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		"from-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"from-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		headers: {
			kind: "parsed",
			brief:
				'Custom email headers as key-value pairs. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		html: {
			kind: "parsed",
			brief:
				"HTML body of the email. Provide at least one of text or html (non-empty).",
			optional: true,
			parse: String,
		},
		"reply-to-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"reply-to-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		subject: {
			kind: "parsed",
			brief: "Email subject line.",
			optional: true,
			parse: String,
		},
		text: {
			kind: "parsed",
			brief:
				"Plain text body of the email. Provide at least one of text or html (non-empty).",
			optional: true,
			parse: String,
		},
		"to-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"to-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
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
		rules.implies("bcc-name", ["bcc-address"]);
		rules.implies("cc-name", ["cc-address"]);
		rules.implies("from-name", ["from-address"]);
		rules.implies("reply-to-name", ["reply-to-address"]);
		rules.implies("to-name", ["to-address"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending send",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["subject"] === undefined) {
						argv["subject"] = await promptForRequiredField(
							"subject",
							"Email subject line."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-sending send",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/send`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											attachments: parseObjectArray(
												argv["attachments"],
												"attachments"
											),
											bcc: {
												address: resolveFileToken(
													argv["bcc-address"] as string | undefined,
													"bcc-address",
													"text"
												),
												name: resolveFileToken(
													argv["bcc-name"] as string | undefined,
													"bcc-name",
													"text"
												),
											},
											cc: {
												address: resolveFileToken(
													argv["cc-address"] as string | undefined,
													"cc-address",
													"text"
												),
												name: resolveFileToken(
													argv["cc-name"] as string | undefined,
													"cc-name",
													"text"
												),
											},
											from: {
												address: resolveFileToken(
													argv["from-address"] as string | undefined,
													"from-address",
													"text"
												),
												name: resolveFileToken(
													argv["from-name"] as string | undefined,
													"from-name",
													"text"
												),
											},
											headers: parseJsonMap(argv["headers"], "headers"),
											html: resolveFileToken(
												argv["html"] as string | undefined,
												"html",
												"text"
											),
											reply_to: {
												address: resolveFileToken(
													argv["reply-to-address"] as string | undefined,
													"reply-to-address",
													"text"
												),
												name: resolveFileToken(
													argv["reply-to-name"] as string | undefined,
													"reply-to-name",
													"text"
												),
											},
											subject: resolveFileToken(
												argv["subject"] as string | undefined,
												"subject",
												"text"
											),
											text: resolveFileToken(
												argv["text"] as string | undefined,
												"text",
												"text"
											),
											to: {
												address: resolveFileToken(
													argv["to-address"] as string | undefined,
													"to-address",
													"text"
												),
												name: resolveFileToken(
													argv["to-name"] as string | undefined,
													"to-name",
													"text"
												),
											},
										},
										[["headers"]]
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
						attachments: parseObjectArray(argv["attachments"], "attachments"),
						bcc: {
							address: resolveFileToken(
								argv["bcc-address"] as string | undefined,
								"bcc-address",
								"text"
							),
							name: resolveFileToken(
								argv["bcc-name"] as string | undefined,
								"bcc-name",
								"text"
							),
						},
						cc: {
							address: resolveFileToken(
								argv["cc-address"] as string | undefined,
								"cc-address",
								"text"
							),
							name: resolveFileToken(
								argv["cc-name"] as string | undefined,
								"cc-name",
								"text"
							),
						},
						from: {
							address: resolveFileToken(
								argv["from-address"] as string | undefined,
								"from-address",
								"text"
							),
							name: resolveFileToken(
								argv["from-name"] as string | undefined,
								"from-name",
								"text"
							),
						},
						headers: parseJsonMap(argv["headers"], "headers"),
						html: resolveFileToken(
							argv["html"] as string | undefined,
							"html",
							"text"
						),
						reply_to: {
							address: resolveFileToken(
								argv["reply-to-address"] as string | undefined,
								"reply-to-address",
								"text"
							),
							name: resolveFileToken(
								argv["reply-to-name"] as string | undefined,
								"reply-to-name",
								"text"
							),
						},
						subject: resolveFileToken(
							argv["subject"] as string | undefined,
							"subject",
							"text"
						),
						text: resolveFileToken(
							argv["text"] as string | undefined,
							"text",
							"text"
						),
						to: {
							address: resolveFileToken(
								argv["to-address"] as string | undefined,
								"to-address",
								"text"
							),
							name: resolveFileToken(
								argv["to-name"] as string | undefined,
								"to-name",
								"text"
							),
						},
					},
					[["headers"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
