/**
 * create command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Event Subscription",
	usage:
		"$0 queues subscriptions create\n\nCreates an event subscription for a Queue.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
