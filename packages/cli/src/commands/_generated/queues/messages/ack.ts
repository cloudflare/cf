import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * ack command
 * @generated from apis/overlays/queues.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 queues messages ack <queue-id>\n\nAcknowledges successfully processed Queue messages and retries messages that were not processed successfully."
		)
		.positional("queue-id", {
			type: "string",
			description: "A Resource identifier.",
			demandOption: true,
		})
		.option("acks", {
			type: "string",
			description:
				"The acks field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("retries", {
			type: "string",
			description:
				"The retries field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"queues-ack-messages">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "ack <queue-id>",
	describe: "Acknowledge + Retry Queue Messages",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues messages ack",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues messages ack",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}/messages/ack`,
						pathParams: { "queue-id": String(argv["queue-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										acks: parseObjectArray(argv["acks"], "acks"),
										retries: parseObjectArray(argv["retries"], "retries"),
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
						client.queues.messages.ack({
							...bodyData,
							account_id: accountId,
							queue_id: argv["queue-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					acks: parseObjectArray(argv["acks"], "acks"),
					retries: parseObjectArray(argv["retries"], "retries"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.queues.messages.ack({
						...bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
