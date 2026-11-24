/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List the custom detection locations of a zone.",
	usage:
		"$0 leaked-credential-checks detections list\n\nList the user-defined detection locations configured for Leaked Credential Checks, each with its own identifier. A custom detection location tells the WAF where to find the username and password in requests to your application.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
