/**
 * create command
 * @generated from apis/overlays/acm.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		certificate: {
			kind: "parsed",
			brief:
				"The root CA certificate in PEM format. Only root CA certificates are accepted; intermediate and leaf certificates are not supported.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Upload Custom Origin Trust Store",
	usage:
		"$0 acm custom-trust-store create\n\nUpload a root CA certificate to the Custom Origin Trust Store for a Zone. Only root CA certificates are accepted.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
