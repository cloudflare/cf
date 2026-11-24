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
			placeholder: "custom-certificate-id",
			brief: "Custom certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <custom-certificate-id>",
	describe: "SSL Configuration Details",
	usage:
		"$0 ssl custom-certificates get <custom-certificate-id>\n\nRetrieves details for a specific custom SSL certificate, including certificate metadata, bundle method, geographic restrictions, and associated keyless server configuration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
