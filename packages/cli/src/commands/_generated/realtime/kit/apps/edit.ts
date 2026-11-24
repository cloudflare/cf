/**
 * edit command
 * @generated from apis/overlays/realtime.ts
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
			brief:
				"The app name. Leading and trailing whitespace is removed, and the name must contain at least one non-whitespace character.",
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
	operands: [{ placeholder: "app-id", brief: "App ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <app-id>",
	describe: "Update an app",
	usage:
		"$0 realtime kit apps edit <app-id>\n\nUpdate the name of an app in your account.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
