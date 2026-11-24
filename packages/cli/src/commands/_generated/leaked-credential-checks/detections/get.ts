/**
 * get command
 * @generated from apis/overlays/leaked-credential-checks.ts
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
		{
			placeholder: "detection-id",
			brief: "Defines the unique ID for this custom detection.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <detection-id>",
	describe: "Get a custom detection location of a zone.",
	usage:
		"$0 leaked-credential-checks detections get <detection-id>\n\nGet the username and password expressions of a single user-defined detection location, identified by its detection ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
