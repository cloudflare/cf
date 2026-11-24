/**
 * test command
 * @generated from apis/overlays/alerting.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		severity: {
			kind: "parsed",
			brief:
				"Severity level for the test alert. Defaults to INFO (1) if omitted.",
			optional: true,
			parse: Number,
		},
		source: {
			kind: "parsed",
			brief: "Source identifier for the test alert.",
			optional: true,
			parse: String,
		},
		"state-correlation-id": {
			kind: "parsed",
			brief:
				"Correlation ID for stateful test alerts. Required when state_event is set.",
			optional: true,
			parse: String,
		},
		"state-event": {
			kind: "parsed",
			brief:
				"State event type for stateful test alerts. Use with state_correlation_id.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Optional configuration for the test notification. When omitted, a default INFO-severity test alert is sent.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "The unique identifier of a notification policy",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "test <policy-id>",
	describe: "Test a Notification policy",
	usage:
		"$0 alerting policies test <policy-id>\n\nSend a test notification for a policy to verify delivery mechanisms are working as expected.",
	...parameters,
	loader: () => import("./test.handler.js"),
});

export default command;
