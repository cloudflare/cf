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
 * createCancelReason command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts subscriptions createCancelReason <subscription-identifier>\n\nRecords a cancellation reason for an account subscription."
		)
		.positional("subscription-identifier", {
			type: "string",
			description: "Subscription identifier tag.",
			demandOption: true,
		})
		.option("other", {
			type: "string",
			description: "Additional cancellation details.",
		})
		.option("reason-code", {
			type: "string",
			array: true,
			description: "The cancellation reason codes.",
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

type Request = SdkRequest<"account-subscriptions-create-cancel-reason">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "createCancelReason <subscription-identifier>",
	describe: "Create Cancel Reason",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts subscriptions createCancelReason",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts subscriptions createCancelReason",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/subscriptions/${argv["subscription-identifier"] == null ? "<subscription-identifier>" : encodeURIComponent(String(argv["subscription-identifier"]))}/cancel-reason`,
						pathParams: {
							"subscription-identifier": String(
								argv["subscription-identifier"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										other: resolveFileToken(
											argv["other"] as string | undefined,
											"other",
											"text"
										),
										reason_code: argv["reason-code"],
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
						client.accounts.subscriptions.createCancelReason({
							...bodyData,
							account_id: accountId,
							subscription_identifier: argv["subscription-identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					other: resolveFileToken(
						argv["other"] as string | undefined,
						"other",
						"text"
					),
					reason_code: argv["reason-code"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.accounts.subscriptions.createCancelReason({
						...bodyData,
						account_id: accountId,
						subscription_identifier: argv["subscription-identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
