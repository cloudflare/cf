/**
 * update command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		certificates: {
			kind: "parsed",
			brief:
				'Array of ordered certificates. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"priority"?: number}]. ? marks optional keys.',
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
	command: "update",
	describe: "Re-prioritize SSL Certificates",
	usage:
		"$0 ssl custom-certificates prioritize update\n\nIf a zone has multiple SSL certificates, you can set the order in which they should be used during a request. The higher priority will break ties across overlapping 'legacy_custom' certificates.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
