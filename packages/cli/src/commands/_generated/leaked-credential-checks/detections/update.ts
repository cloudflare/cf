/**
 * update command
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		password: {
			kind: "parsed",
			brief:
				"Defines ehe ruleset expression to use in matching the password in a request.",
			optional: true,
			parse: String,
		},
		username: {
			kind: "parsed",
			brief:
				"Defines the ruleset expression to use in matching the username in a request.",
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
			brief:
				"Defines a custom set of username/password expressions to match Leaked Credential Checks on.",
			optional: true,
			parse: String,
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
	command: "update <detection-id>",
	describe: "Update a custom detection location of a zone.",
	usage:
		"$0 leaked-credential-checks detections update <detection-id>\n\nUpdate the username and password expressions of an existing detection location, identified by its detection ID. Both expressions are overwritten, so omitting the password expression clears it.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
