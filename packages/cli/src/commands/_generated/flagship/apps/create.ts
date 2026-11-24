/**
 * create command
 * @generated from apis/overlays/flagship.ts
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
				"Name of the Flagship app (1–64 letters, numbers, hyphens, or underscores).",
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
	describe: "Create app",
	usage:
		"$0 flagship apps create\n\nCreates an app. The returned `id` is used in all subsequent flag, changelog, and evaluation requests.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
