/**
 * get command
 * @generated from apis/overlays/custom-hostnames.ts
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
			placeholder: "custom-hostname-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <custom-hostname-id>",
	describe: "Custom Hostname Details",
	usage:
		"$0 custom-hostnames get <custom-hostname-id>\n\nRetrieves detailed information about a specific custom hostname, including SSL certificate status, ownership verification, and origin configuration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
