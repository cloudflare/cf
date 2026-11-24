/**
 * get command
 * @generated from apis/overlays/ssl.ts
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
			placeholder: "keyless-certificate-id",
			brief: "Keyless certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <keyless-certificate-id>",
	describe: "Get Keyless SSL Configuration",
	usage:
		"$0 ssl keyless-certificates get <keyless-certificate-id>\n\nGet details for one Keyless SSL configuration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
