import operation from "../../_operations/queues/subscriptions/create.js";
/**
 * create command
 * @generated from apis/overlays/queues.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create Event Subscription",
	usage:
		"$0 queues subscriptions create\n\nCreates an event subscription for a Queue.",
	flags: {
		"destination-queue-id": {
			kind: "parsed",
			brief: "ID of the target queue",
			optional: true,
			parse: String,
		},
		"destination-type": {
			kind: "parsed",
			brief: "Type of destination",
			optional: true,
			choices: ["queues.queue"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "destination-type", "text"),
		},
		enabled: {
			kind: "boolean",
			brief: "Whether the subscription is active",
			optional: true,
		},
		events: {
			kind: "parsed",
			brief: "List of event types this subscription handles",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the subscription",
			optional: true,
			parse: String,
		},
		"source-type": {
			kind: "parsed",
			brief: "Type of source",
			optional: true,
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
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "source-type", "text"),
		},
		"source-model-name": {
			kind: "parsed",
			brief: "Name of the Workers AI model",
			optional: true,
			parse: String,
		},
		"source-worker-name": {
			kind: "parsed",
			brief: "Name of the worker",
			optional: true,
			parse: String,
		},
		"source-script-tag": {
			kind: "parsed",
			brief: "Tag of the Worker script",
			optional: true,
			parse: String,
		},
		"source-workflow-name": {
			kind: "parsed",
			brief: "Name of the workflow",
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["destination-queue-id", "destination-type"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
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
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues subscriptions create",
				classification: {
					safeFlags: ["destination-type", "enabled", "source-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
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
											type: argv["destination-type"],
										},
										enabled: argv["enabled"],
										events: argv["events"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										source: {
											type: argv["source-type"],
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					source: {
						type: argv["source-type"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
