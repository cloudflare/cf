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
 * create command
 * @generated from apis/overlays/queues.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 queues subscriptions create\n\nCreates an event subscription for a Queue."
		)
		.option("destination-queue-id", {
			type: "string",
			description: "ID of the target queue",
		})
		.option("destination-type", {
			type: "string",
			description: "Type of destination",
			choices: ["queues.queue"],
		})
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
		.option("source-type", {
			type: "string",
			description: "Type of source",
			choices: [
				"images",
				"kv",
				"r2",
				"superSlurper",
				"vectorize",
				"workersAi.model",
				"workersBuilds.worker",
				"workers.script",
				"workflows.workflow",
			],
		})
		.option("source-model-name", {
			type: "string",
			description: "Name of the Workers AI model",
		})
		.option("source-worker-name", {
			type: "string",
			description: "Name of the worker",
		})
		.option("source-script-tag", {
			type: "string",
			description: "Tag of the Worker script",
		})
		.option("source-workflow-name", {
			type: "string",
			description: "Name of the workflow",
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
		.conflicts("source-model-name", [
			"source-worker-name",
			"source-script-tag",
			"source-workflow-name",
		])
		.conflicts("source-worker-name", [
			"source-model-name",
			"source-script-tag",
			"source-workflow-name",
		])
		.conflicts("source-script-tag", [
			"source-model-name",
			"source-worker-name",
			"source-workflow-name",
		])
		.conflicts("source-workflow-name", [
			"source-model-name",
			"source-worker-name",
			"source-script-tag",
		])
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

type Request = SdkRequest<"subscriptions-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Event Subscription",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues subscriptions create",
				classification: {
					safeFlags: ["destination-type", "enabled", "source-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues subscriptions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/event_subscriptions/subscriptions`,
						pathParams: {},
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
											type: resolveFileToken(
												argv["destination-type"] as string | undefined,
												"destination-type",
												"text"
											),
										},
										enabled: argv["enabled"],
										events: argv["events"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										source: {
											type: resolveFileToken(
												argv["source-type"] as string | undefined,
												"source-type",
												"text"
											),
											model_name: resolveFileToken(
												argv["source-model-name"] as string | undefined,
												"source-model-name",
												"text"
											),
											worker_name: resolveFileToken(
												argv["source-worker-name"] as string | undefined,
												"source-worker-name",
												"text"
											),
											script_tag: resolveFileToken(
												argv["source-script-tag"] as string | undefined,
												"source-script-tag",
												"text"
											),
											workflow_name: resolveFileToken(
												argv["source-workflow-name"] as string | undefined,
												"source-workflow-name",
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
						client.queues.subscriptions.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
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
						type: resolveFileToken(
							argv["destination-type"] as string | undefined,
							"destination-type",
							"text"
						),
					},
					enabled: argv["enabled"],
					events: argv["events"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					source: {
						type: resolveFileToken(
							argv["source-type"] as string | undefined,
							"source-type",
							"text"
						),
						model_name: resolveFileToken(
							argv["source-model-name"] as string | undefined,
							"source-model-name",
							"text"
						),
						worker_name: resolveFileToken(
							argv["source-worker-name"] as string | undefined,
							"source-worker-name",
							"text"
						),
						script_tag: resolveFileToken(
							argv["source-script-tag"] as string | undefined,
							"source-script-tag",
							"text"
						),
						workflow_name: resolveFileToken(
							argv["source-workflow-name"] as string | undefined,
							"source-workflow-name",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.queues.subscriptions.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
