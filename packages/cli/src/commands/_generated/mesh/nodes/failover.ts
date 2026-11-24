/**
 * failover command
 * @generated from apis/overlays/mesh.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"connector-id": {
			kind: "parsed",
			brief: "UUID of the Cloudflare Tunnel connector.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
		{ placeholder: "node-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "failover <node-id>",
	describe: "Trigger a manual failover for a Mesh node",
	usage:
		"$0 mesh nodes failover <node-id>\n\nTriggers a manual failover for a specific Mesh node, setting the specified client as the active connector. The tunnel must be configured for high availability (HA) and the client must be linked to the tunnel.",
	...parameters,
	loader: () => import("./failover.handler.js"),
});

export default command;
