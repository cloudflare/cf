/**
 * update command
 * @generated from apis/overlays/rum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ruleset-id": {
			kind: "parsed",
			brief: "The Web Analytics ruleset identifier.",
			parse: String,
		},
		host: {
			kind: "parsed",
			brief: "The host field",
			optional: true,
			parse: String,
		},
		inclusive: {
			kind: "boolean",
			brief:
				"Whether the rule includes or excludes traffic from being measured.",
			optional: true,
		},
		"is-paused": {
			kind: "boolean",
			brief: "Whether the rule is paused or not.",
			optional: true,
		},
		paths: {
			kind: "parsed",
			brief: "The paths field",
			variadic: true,
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
			placeholder: "rule-id",
			brief: "The Web Analytics rule identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <rule-id>",
	describe: "Update a Web Analytics rule",
	usage:
		"$0 rum rules update <rule-id>\n\nUpdates a rule in a Web Analytics ruleset.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
