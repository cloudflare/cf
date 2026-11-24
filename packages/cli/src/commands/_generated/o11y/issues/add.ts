/**
 * add command
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
	operands: [{ placeholder: "group-id", brief: "GroupId", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "add <groupId>",
	describe: "Add issue group members",
	usage:
		"$0 o11y issues add <groupId>\n\nAdd one or more ungrouped issues to an existing issue group.",
	...parameters,
	loader: () => import("./add.handler.js"),
});

export default command;
