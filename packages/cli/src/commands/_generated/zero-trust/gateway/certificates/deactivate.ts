/**
 * deactivate command
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
			placeholder: "certificate-id",
			brief: "Identify the certificate with a UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "deactivate <certificate-id>",
	describe: "Deactivate a Zero Trust certificate",
	usage:
		"$0 zero-trust gateway certificates deactivate <certificate-id>\n\nUnbind a single Zero Trust certificate from the edge.",
	...parameters,
	loader: () => import("./deactivate.handler.js"),
});

export default command;
