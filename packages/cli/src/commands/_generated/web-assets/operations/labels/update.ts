/**
 * update command
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
			brief:
				"List of managed label names. Omitting this property or passing an empty array will result in all managed labels being removed from the operation",
			variadic: true,
			optional: true,
			parse: String,
		},
		user: {
			kind: "parsed",
			brief:
				"List of user label names. Omitting this property or passing an empty array will result in all user labels being removed from the operation",
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
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <operation-id>",
	describe: "Replace labels on a web or API operation",
	usage:
		"$0 web-assets operations labels update <operation-id>\n\nReplaces the complete label set on a web or API operation.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
