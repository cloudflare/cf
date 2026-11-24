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
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <name>",
	describe: "Replace operations attached to a user-defined label",
	usage:
		"$0 web-assets labels user operations update <name>\n\nReplaces the complete set of web and API operations attached to the user-defined label.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
