import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
			"$0 queues subscriptions update <subscription-id>\n\nUpdates an existing Queue event subscription."
		)
		.positional("subscription-id", {
			type: "string",
			description: "A Resource identifier.",
			demandOption: true,
		})
		.option("destination-queue-id", {
			type: "string",
			description: "ID of the target queue",
		})
		.option("destination-type", {
			type: "string",
			description: "Type of destination",
			choices: ["queues.queue"],
		})
		.coerce("destination-type", (value) =>
			resolveFileToken(value, "destination-type", "text")
		)
		.option("enabled", {
			type: "boolean",
			description: "Whether the subscription is active",
		})
		.option("events", {
			type: "string",
			array: true,
			description: "List of event types this subscription handles",
		})
		.option("name", { type: "string", description: "Name of the subscription" })
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
			const groupSet = ["destination-queue-id", "destination-type"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["destination-queue-id", "destination-type"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --destination-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"subscriptions-patch">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <subscription-id>",
	describe: "Update Event Subscription",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues subscriptions update",
				classification: {
					safeFlags: ["destination-type", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues subscriptions update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/event_subscriptions/subscriptions/${argv["subscription-id"] == null ? "<subscription-id>" : encodeURIComponent(String(argv["subscription-id"]))}`,
						pathParams: {
							"subscription-id": String(argv["subscription-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination: {
											queue_id: resolveFileToken(
												argv["destination-queue-id"] as string | undefined,
												"destination-queue-id",
												"text"
											),
											type: argv["destination-type"],
										},
										enabled: argv["enabled"],
										events: argv["events"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.queues.subscriptions.update({
							...bodyData,
							account_id: accountId,
							subscription_id: argv["subscription-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destination: {
						queue_id: resolveFileToken(
							argv["destination-queue-id"] as string | undefined,
							"destination-queue-id",
							"text"
						),
						type: argv["destination-type"],
					},
					enabled: argv["enabled"],
					events: argv["events"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.queues.subscriptions.update({
						...bodyData,
						account_id: accountId,
						subscription_id: argv["subscription-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
