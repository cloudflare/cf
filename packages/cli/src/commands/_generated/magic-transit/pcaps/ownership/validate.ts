/**
 * validate command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"destination-conf": {
			kind: "parsed",
			brief:
				"The full URI for the bucket. This field only applies to `full` packet captures.",
			optional: true,
			parse: String,
		},
		"ownership-challenge": {
			kind: "parsed",
			brief: "The ownership challenge filename stored in the bucket.",
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
	command: "validate",
	describe: "Validate buckets for full packet captures",
	usage:
		"$0 magic-transit pcaps ownership validate\n\nValidates buckets added to the packet captures API.",
	...parameters,
	loader: () => import("./validate.handler.js"),
});

export default command;
