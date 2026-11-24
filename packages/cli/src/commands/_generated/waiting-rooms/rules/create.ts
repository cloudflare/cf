/**
 * create command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		action: {
			kind: "parsed",
			brief: "The action to take when the expression matches.",
			optional: true,
			choices: ["bypass_waiting_room"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		description: {
			kind: "parsed",
			brief: "The description of the rule.",
			default: "",
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "When set to true, the rule is enabled.",
			default: true,
		},
		expression: {
			kind: "parsed",
			brief: "Criteria defining when there is a match for the current rule.",
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
		{ placeholder: "waiting-room-id", brief: "Waiting room ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <waiting-room-id>",
	describe: "Create Waiting Room Rule",
	usage:
		"$0 waiting-rooms rules create <waiting-room-id>\n\nOnly available for the Waiting Room Advanced subscription. Creates a rule for a waiting room.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
