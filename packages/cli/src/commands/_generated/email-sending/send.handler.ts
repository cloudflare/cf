import operation from "../_operations/email-sending/send.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./send.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
