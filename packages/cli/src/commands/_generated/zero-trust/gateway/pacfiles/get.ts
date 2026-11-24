/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
	},
	operands: [{ placeholder: "pacfile-id", brief: "Pacfile ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pacfile-id>",
	describe: "Get a PAC file",
	usage:
		"$0 zero-trust gateway pacfiles get <pacfile-id>\n\nGet a single Zero Trust Gateway PAC file.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
