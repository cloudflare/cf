/**
 * get command
 * @generated from apis/overlays/speed.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		url: { kind: "parsed", brief: "A URL.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "test-id", brief: "Test ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <test-id>",
	describe: "Get a page test result",
	usage:
		"$0 speed pages tests get <test-id>\n\nRetrieves the result of a specific test.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
