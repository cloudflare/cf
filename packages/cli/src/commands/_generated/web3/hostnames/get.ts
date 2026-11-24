/**
 * get command
 * @generated from apis/overlays/web3.ts
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
			placeholder: "identifier",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <identifier>",
	describe: "Web3 Hostname Details",
	usage:
		"$0 web3 hostnames get <identifier>\n\nRetrieves details for a specific Web3 hostname, including its target gateway and DNSLink settings.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
