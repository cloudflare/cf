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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * move command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security investigate move\n\nMoves one or more messages to a specified mailbox folder (Inbox, JunkEmail, DeletedItems, RecoverableItemsDeletions, or RecoverableItemsPurges). Requires active integration. Operates on an explicit list of messages; to move all messages matching a search, create a bulk action job instead."
		)
		.option("destination", {
			type: "string",
			description: "The mailbox folder to move messages to.",
			choices: [
				"Inbox",
				"JunkEmail",
				"DeletedItems",
				"RecoverableItemsDeletions",
				"RecoverableItemsPurges",
			],
		})
		.option("ids", {
			type: "string",
			array: true,
			description: "List of message IDs to move.",
		})
		.option("postfix-ids", {
			type: "string",
			array: true,
			description:
				"Deprecated, use `ids` instead. End of life: November 1, 2026.",
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

type Request = SdkRequest<"email_security_post_bulk_move">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "move",
	describe: "Move messages",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security investigate move",
				classification: {
					safeFlags: ["destination", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security investigate move",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/move`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination: resolveFileToken(
											argv["destination"] as string | undefined,
											"destination",
											"text"
										),
										ids: argv["ids"],
										postfix_ids: argv["postfix-ids"],
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
						client.emailSecurity.investigate.move({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination"] === undefined) {
					argv["destination"] = await promptForRequiredEnumField(
						"destination",
						"The mailbox folder to move messages to.",
						[
							"Inbox",
							"JunkEmail",
							"DeletedItems",
							"RecoverableItemsDeletions",
							"RecoverableItemsPurges",
						] as const
					);
				}
				if (argv["ids"] === undefined) {
					throw new Error(
						"--ids is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destination: resolveFileToken(
						argv["destination"] as string | undefined,
						"destination",
						"text"
					),
					ids: argv["ids"],
					postfix_ids: argv["postfix-ids"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.emailSecurity.investigate.move({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
