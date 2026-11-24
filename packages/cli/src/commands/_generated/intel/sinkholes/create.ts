/**
 * create command
 * @generated from apis/overlays/intel.ts
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
			brief: "The name of the sinkhole.",
			optional: true,
			parse: String,
		},
		"r2-bucket": {
			kind: "parsed",
			brief:
				"The name of the R2 bucket to store results. Required if you want to store large request bodies in R2.",
			optional: true,
			parse: String,
		},
		"r2-id": {
			kind: "parsed",
			brief:
				"The id of the R2 instance. Required if you want to store large request bodies in R2.",
			optional: true,
			parse: String,
		},
		"r2-secret": {
			kind: "parsed",
			brief:
				"The secret key for the R2 API token. Required if you want to store large request bodies in R2.",
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
	describe: "Create a new sinkhole for your account",
	usage:
		"$0 intel sinkholes create\n\nCreate a new sinkhole. Logs of large request bodies will be truncated, but the full request body can be recorded in R2. If you wish to record large request bodies in R2, include the R2 key ID, key secret, and bucket name in the request body.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
