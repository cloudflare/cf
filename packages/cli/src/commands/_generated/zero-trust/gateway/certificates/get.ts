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
		{
			placeholder: "certificate-id",
			brief: "Identify the certificate with a UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <certificate-id>",
	describe: "Get Zero Trust certificate details",
	usage:
		"$0 zero-trust gateway certificates get <certificate-id>\n\nGet a single Zero Trust certificate.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
