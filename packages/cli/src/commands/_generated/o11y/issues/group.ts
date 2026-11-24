/**
 * group command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"issue-ids": {
			kind: "parsed",
			brief: "The issueIds field",
			variadic: true,
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "The title field",
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "group",
	describe: "Create an issue group",
	usage:
		"$0 o11y issues group\n\nGroup two or more issues under a new customer-defined identity.",
	...parameters,
	loader: () => import("./group.handler.js"),
});

export default command;
