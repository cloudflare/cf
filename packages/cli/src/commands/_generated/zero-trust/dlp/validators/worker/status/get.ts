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
	operands: [
		{ placeholder: "validator-id", brief: "Validator ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <validator-id>",
	describe: "Get a worker validator status",
	usage:
		"$0 zero-trust dlp validators worker status get <validator-id>\n\nReports whether the validator's Worker can be used. Returns `worker_not_found` if the Worker cannot be found, and `worker_error` if the Worker does not have a valid validation entrypoint or is returning incorrect responses.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
