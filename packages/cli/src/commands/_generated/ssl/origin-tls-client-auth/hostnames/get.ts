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
			placeholder: "hostname",
			brief:
				"The hostname on the origin for which the client certificate uploaded will be used.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <hostname>",
	describe: "Get the Hostname Status for Client Authentication",
	usage:
		"$0 ssl origin-tls-client-auth hostnames get <hostname>\n\nRetrieves the client certificate authentication status for a specific hostname, showing whether authenticated origin pulls are enabled.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
