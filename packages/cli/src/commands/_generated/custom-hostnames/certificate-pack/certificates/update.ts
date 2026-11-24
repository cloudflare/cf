/**
 * update command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"custom-hostname-id": {
			kind: "parsed",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
		"certificate-pack-id": {
			kind: "parsed",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
		"custom-certificate": {
			kind: "parsed",
			brief: "If a custom uploaded certificate is used.",
			optional: true,
			parse: String,
		},
		"custom-key": {
			kind: "parsed",
			brief: "The key for a custom uploaded certificate.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "certificate-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <certificate-id>",
	describe: "Replace Custom Certificate and Custom Key In Custom Hostname",
	usage:
		"$0 custom-hostnames certificate-pack certificates update <certificate-id>\n\nReplace a single custom certificate within a certificate pack that contains two bundled certificates. The replacement must adhere to the following constraints. You can only replace an RSA certificate with another RSA certificate or an ECDSA certificate with another ECDSA certificate.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
