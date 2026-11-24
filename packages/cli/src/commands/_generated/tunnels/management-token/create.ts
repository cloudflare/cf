/**
 * create command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		resources: {
			kind: "parsed",
			brief: "The resources field",
			variadic: true,
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
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <tunnel-id>",
	describe: "Get a Cloudflare Tunnel management token",
	usage:
		"$0 tunnels management-token create <tunnel-id>\n\nCreates a short-lived management token for the requested Tunnel management resources, such as streaming logs. Treat the token as a secret.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
