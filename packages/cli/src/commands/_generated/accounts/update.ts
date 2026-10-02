import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 accounts update\n\nUpdate an existing account.")
		.option("id", { type: "string", description: "Identifier" })
		.option("name", { type: "string", description: "Account name" })
		.option("settings-abuse-contact-email", {
			type: "string",
			description: "Sets an abuse contact email to notify for abuse reports.",
		})
		.option("settings-enforce-twofactor", {
			type: "boolean",
			description:
				"Indicates whether membership in this account requires that\nTwo-Factor Authentication is enabled",
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

type Request = SdkRequest<"accounts-update-account">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Account",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts update",
				classification: {
					safeFlags: ["settings-enforce-twofactor", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										settings: {
											abuse_contact_email: resolveFileToken(
												argv["settings-abuse-contact-email"] as
													| string
													| undefined,
												"settings-abuse-contact-email",
												"text"
											),
											enforce_twofactor: argv["settings-enforce-twofactor"],
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.accounts.update({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["id"] === undefined) {
					argv["id"] = await promptForRequiredField("id", "Identifier");
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "Account name");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					settings: {
						abuse_contact_email: resolveFileToken(
							argv["settings-abuse-contact-email"] as string | undefined,
							"settings-abuse-contact-email",
							"text"
						),
						enforce_twofactor: argv["settings-enforce-twofactor"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.accounts.update({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
