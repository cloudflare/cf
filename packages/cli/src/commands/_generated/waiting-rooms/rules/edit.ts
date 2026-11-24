/**
 * edit command
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
		"waiting-room-id": {
			kind: "parsed",
			brief: "Waiting room ID",
			parse: String,
		},
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
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "When set to true, the rule is enabled.",
			optional: true,
		},
		expression: {
			kind: "parsed",
			brief: "Criteria defining when there is a match for the current rule.",
			optional: true,
			parse: String,
		},
		"position-index": {
			kind: "parsed",
			brief:
				"Places the rule in the exact position specified by the integer number <POSITION_NUMBER>. Position numbers start with 1. Existing rules in the ruleset from the specified position number onward are shifted one position (no rule is overwritten).",
			optional: true,
			parse: Number,
		},
		"position-before": {
			kind: "parsed",
			brief:
				'Places the rule before rule <RULE_ID>. Use this argument with an empty rule ID value ("") to set the rule as the first rule in the ruleset.',
			optional: true,
			parse: String,
		},
		"position-after": {
			kind: "parsed",
			brief:
				'Places the rule after rule <RULE_ID>. Use this argument with an empty rule ID value ("") to set the rule as the last rule in the ruleset.',
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
		{ placeholder: "rule-id", brief: "The ID of the rule.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Patch Waiting Room Rule",
	usage:
		"$0 waiting-rooms rules edit <rule-id>\n\nPatches a rule for a waiting room.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
