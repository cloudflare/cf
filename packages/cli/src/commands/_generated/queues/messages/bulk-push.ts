import operation from "../../_operations/queues/messages/bulk-push.js";
/**
 * bulk-push command
 * @generated from apis/overlays/queues.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "bulk-push",
	describe: "Push Message Batch",
	usage:
		"$0 queues messages bulk-push\n\nPushes a batch of messages to a Queue.",
	flags: {
		"queue-id": {
			kind: "parsed",
			brief: "A Resource identifier.",
			parse: String,
		},
		"delay-seconds": {
			kind: "parsed",
			brief:
				"The number of seconds to wait for attempting to deliver this batch to consumers",
			optional: true,
			parse: Number,
		},
		messages: {
			kind: "parsed",
			brief:
				'The messages field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"delay_seconds"?: number} & ({"body"?: string, "content_type"?: "text"} | {"body"?: {...}, "content_type"?: "json"}))]. ? marks optional keys.',
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues messages bulk-push",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues messages bulk-push",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}/messages/batch`,
						pathParams: { "queue-id": String(argv["queue-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										delay_seconds: argv["delay-seconds"],
										messages: parseObjectArray(argv["messages"], "messages"),
									}),
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							queue_id: argv["queue-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					delay_seconds: argv["delay-seconds"],
					messages: parseObjectArray(argv["messages"], "messages"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
