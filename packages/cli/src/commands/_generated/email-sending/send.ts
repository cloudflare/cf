import operation from "../_operations/email-sending/send.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * send command
 * @generated from apis/overlays/email-sending.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-sending send\n\nSend an email for the specified account using the structured builder. Provide the sender, recipients, subject, and at least one of text or html; attachments are optional."
		)
		.option("attachments", {
			type: "string",
			description:
				"File attachments and inline images. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("bcc-address", {
			type: "string",
			description: "Email address (e.g., 'user@example.com').",
		})
		.option("bcc-name", {
			type: "string",
			description:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
		})
		.option("cc-address", {
			type: "string",
			description: "Email address (e.g., 'user@example.com').",
		})
		.option("cc-name", {
			type: "string",
			description:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
		})
		.option("from-address", {
			type: "string",
			description: "Email address (e.g., 'user@example.com').",
		})
		.option("from-name", {
			type: "string",
			description:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
		})
		.option("html", {
			type: "string",
			description:
				"HTML body of the email. Provide at least one of text or html (non-empty).",
		})
		.option("reply-to-address", {
			type: "string",
			description: "Email address (e.g., 'user@example.com').",
		})
		.option("reply-to-name", {
			type: "string",
			description:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
		})
		.option("subject", { type: "string", description: "Email subject line." })
		.option("text", {
			type: "string",
			description:
				"Plain text body of the email. Provide at least one of text or html (non-empty).",
		})
		.option("to-address", {
			type: "string",
			description: "Email address (e.g., 'user@example.com').",
		})
		.option("to-name", {
			type: "string",
			description:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
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
	command: "send",
	describe: "Send an email",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending send",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
								: compactBody({
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["subject"] === undefined) {
					argv["subject"] = await promptForRequiredField(
						"subject",
						"Email subject line."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
