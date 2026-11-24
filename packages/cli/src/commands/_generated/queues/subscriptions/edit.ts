/**
 * edit command
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
	operands: [
		{
			placeholder: "subscription-id",
			brief: "A Resource identifier.",
			parse: String,
		},
	],
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
	command: "edit <subscription-id>",
	describe: "Update Event Subscription",
	usage:
		"$0 queues subscriptions edit <subscription-id>\n\nUpdates an existing Queue event subscription.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
