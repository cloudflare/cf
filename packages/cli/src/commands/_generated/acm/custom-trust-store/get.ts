/**
 * get command
 * @generated from apis/overlays/acm.ts
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
			placeholder: "custom-origin-trust-store-id",
			brief: "Certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <custom-origin-trust-store-id>",
	describe: "Custom Origin Trust Store Details",
	usage:
		"$0 acm custom-trust-store get <custom-origin-trust-store-id>\n\nRetrieves details about a specific root CA certificate in the custom origin trust store, including expiration and subject information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
