/**
 * get command
 * @generated from apis/overlays/mesh.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"node-id": { kind: "parsed", brief: "UUID of the tunnel.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "connector-id",
			brief: "UUID of the Cloudflare Tunnel connector.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <connector-id>",
	describe: "Get a Mesh node connector",
	usage:
		"$0 mesh nodes connectors get <connector-id>\n\nFetches connector and connection details for a Mesh node.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
