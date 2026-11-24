/**
 * delete command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		managed: {
			kind: "parsed",
			brief: "List of managed label names.",
			variadic: true,
			optional: true,
			parse: String,
		},
		user: {
			kind: "parsed",
			brief: "List of user label names.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <operation-id>",
	describe: "Remove labels from a web or API operation",
	usage:
		"$0 web-assets operations labels delete <operation-id>\n\nRemoves one or more labels from a web or API operation.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
