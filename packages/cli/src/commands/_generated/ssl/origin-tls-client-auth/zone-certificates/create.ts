/**
 * create command
 * @generated from apis/overlays/ssl.ts
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
			brief: "The zone's leaf certificate.",
			optional: true,
			parse: String,
		},
		"private-key": {
			kind: "parsed",
			brief: "The zone's private key.",
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
	describe: "Upload Certificate",
	usage:
		"$0 ssl origin-tls-client-auth zone-certificates create\n\nUpload your own certificate you want Cloudflare to use for edge-to-origin communication to override the shared certificate. Please note that it is important to keep only one certificate active. Also, make sure to enable zone-level authenticated origin pulls by making a PUT call to settings endpoint to see the uploaded certificate in use.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
