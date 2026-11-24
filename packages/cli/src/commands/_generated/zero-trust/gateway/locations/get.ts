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
		{ placeholder: "location-id", brief: "Location ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <location-id>",
	describe: "Get Zero Trust Gateway location details",
	usage:
		"$0 zero-trust gateway locations get <location-id>\n\nGet a single Zero Trust Gateway location.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
