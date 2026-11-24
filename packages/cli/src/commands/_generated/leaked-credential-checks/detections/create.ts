/**
 * create command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a custom detection location for a zone.",
	usage:
		'$0 leaked-credential-checks detections create\n\nCreate a detection location for credentials that the default scan locations do not cover, using Rules language expressions such as `lookup_json_string(http.request.body.raw, "user")`. Only the username expression is required, and Leaked Credential Checks must be enabled on the zone.',
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
