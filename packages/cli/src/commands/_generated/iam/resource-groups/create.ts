/**
 * create command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "Name of the resource group",
			optional: true,
			parse: String,
		},
		"scope-objects": {
			kind: "parsed",
			brief:
				'A list of scope objects for additional context. The number of Scope objects should not be zero. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": unknown}].',
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
	command: "create",
	describe: "Create Resource Group",
	usage:
		"$0 iam resource-groups create\n\nCreate a new Resource Group under the specified account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
