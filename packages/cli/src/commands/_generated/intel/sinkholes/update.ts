/**
 * update command
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
	operands: [
		{
			placeholder: "sinkhole-id",
			brief: "The unique identifier for the sinkhole.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <sinkhole-id>",
	describe: "Update a sinkhole",
	usage:
		"$0 intel sinkholes update <sinkhole-id>\n\nReplaces the name or R2 configuration of the specified sinkhole. This is a full replacement. All fields, including r2_secret, must be re-supplied. Omitting r2_secret overwrites the stored value with an empty string.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
