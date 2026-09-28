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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/email-sending.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-sending suppressions create\n\nCreates a suppression for every sending domain of the account (default) or for one sending domain (`scope.type = sending_domain`). Creating an existing active suppression returns its identifier. If a mutable legacy zone-linked account row already exists, it is promoted without changing its identifier."
		)
		.option("email", {
			type: "string",
			description: "The email address to suppress.",
		})
		.option("expires-at", {
			type: "string",
			description:
				"Expiration timestamp for the suppression. Omit or set to null for a permanent suppression that never expires.",
		})
		.option("note", {
			type: "string",
			description:
				"Advisory note for this suppression. Not enforced or validated beyond length.",
		})
		.option("scope-type", {
			type: "string",
			description:
				"Blocks the recipient for every sending domain of the account.",
			choices: ["account", "sending_domain"],
		})
		.option("scope-value", {
			type: "string",
			description:
				"The sending domain to suppress for: the domain part of the envelope MAIL FROM. It is lowercased and trailing dots are removed. Internationalized domains must use the ASCII (punycode) form. Ownership is not checked; a domain the account does not send from never matches.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = ["scope-type", "scope-value"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["scope-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --scope-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"post_publicCreateSendingSuppression">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create account Email Sending suppression",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending suppressions create",
				classification: {
					safeFlags: ["scope-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
								: compactBody({
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
											type: resolveFileToken(
												argv["scope-type"] as string | undefined,
												"scope-type",
												"text"
											),
											value: resolveFileToken(
												argv["scope-value"] as string | undefined,
												"scope-value",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.emailSending.suppressions.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"The email address to suppress."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						type: resolveFileToken(
							argv["scope-type"] as string | undefined,
							"scope-type",
							"text"
						),
						value: resolveFileToken(
							argv["scope-value"] as string | undefined,
							"scope-value",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.emailSending.suppressions.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
