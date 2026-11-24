/**
 * reset-expiration command
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
		{
			placeholder: "rule-id",
			brief: "Identify the API resource with a UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "reset-expiration <rule-id>",
	describe: "Reset the expiration of a Zero Trust Gateway Rule",
	usage:
		"$0 zero-trust gateway rules reset-expiration <rule-id>\n\nResets the expiration of a Zero Trust Gateway Rule if its duration elapsed and it has a default duration. The Zero Trust Gateway Rule must have values for both `expiration.expires_at` and `expiration.duration`.",
	...parameters,
	loader: () => import("./reset-expiration.handler.js"),
});

export default command;
