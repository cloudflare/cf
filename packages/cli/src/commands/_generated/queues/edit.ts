import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/queues.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 queues edit <queue-id>\n\nUpdates part of a Queue's configuration."
		)
		.positional("queue-id", {
			type: "string",
			description: "A Resource identifier.",
			demandOption: true,
		})
		.option("jurisdiction", {
			type: "string",
			description: "The jurisdiction field",
			choices: ["eu", "us", "fedramp"],
		})
		.option("queue-name", {
			type: "string",
			description: "The queue_name field",
		})
		.option("settings-delivery-delay", {
			type: "number",
			description:
				"Number of seconds to delay delivery of all messages to consumers.",
		})
		.option("settings-delivery-paused", {
			type: "boolean",
			description:
				"Indicates if message delivery to consumers is currently paused.",
		})
		.option("settings-message-retention-period", {
			type: "number",
			description:
				"Number of seconds after which an unconsumed message will be delayed.",
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

type Request = SdkRequest<"queues-update-partial">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <queue-id>",
	describe: "Update Queue",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues edit",
				classification: {
					safeFlags: ["jurisdiction", "settings-delivery-paused", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}`,
						pathParams: { "queue-id": String(argv["queue-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										jurisdiction: resolveFileToken(
											argv["jurisdiction"] as string | undefined,
											"jurisdiction",
											"text"
										),
										queue_name: resolveFileToken(
											argv["queue-name"] as string | undefined,
											"queue-name",
											"text"
										),
										settings: {
											delivery_delay: argv["settings-delivery-delay"],
											delivery_paused: argv["settings-delivery-paused"],
											message_retention_period:
												argv["settings-message-retention-period"],
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
						client.queues.edit({
							body: bodyData,
							account_id: accountId,
							queue_id: argv["queue-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
					queue_name: resolveFileToken(
						argv["queue-name"] as string | undefined,
						"queue-name",
						"text"
					),
					settings: {
						delivery_delay: argv["settings-delivery-delay"],
						delivery_paused: argv["settings-delivery-paused"],
						message_retention_period: argv["settings-message-retention-period"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.queues.edit({
						body: bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
