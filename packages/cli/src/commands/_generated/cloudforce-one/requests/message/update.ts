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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one requests message update <message-id>\n\nUpdates a message in a Cloudforce One intelligence request thread."
		)
		.positional("message-id", {
			type: "string",
			description: "Message ID",
			demandOption: true,
		})
		.option("request-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("content", { type: "string", description: "Content of message." })
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

type Request = SdkRequest<"cloudforce-one-request-message-update">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <message-id>",
	describe: "Update a Request Message",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests message update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests message update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/requests/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/message/${argv["message-id"] == null ? "<message-id>" : encodeURIComponent(String(argv["message-id"]))}`,
						pathParams: {
							"request-id": String(argv["request-id"] ?? ""),
							"message-id": String(argv["message-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										content: resolveFileToken(
											argv["content"] as string | undefined,
											"content",
											"text"
										),
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
						client.cloudforceOne.requests.message.update({
							body: bodyData,
							account_id: accountId,
							request_id: argv["request-id"],
							message_id: argv["message-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					content: resolveFileToken(
						argv["content"] as string | undefined,
						"content",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.requests.message.update({
						body: bodyData,
						account_id: accountId,
						request_id: argv["request-id"],
						message_id: argv["message-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
