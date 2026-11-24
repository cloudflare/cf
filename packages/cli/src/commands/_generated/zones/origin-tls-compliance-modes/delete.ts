/**
 * delete command
 * @generated from apis/overlays/zones.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Delete Origin TLS Compliance Modes setting",
	usage:
		"$0 zones origin-tls-compliance-modes delete\n\nDelete the Origin TLS Compliance Modes setting for the zone, removing any configured compliance constraint. After deletion, Cloudflare's default behavior applies (no compliance filtering of the key-exchange algorithm list sent to the origin).",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
