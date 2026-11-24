/**
 * delete command
 * @generated from apis/overlays/o11y.ts
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
	describe: "Reset zone tracing settings",
	usage:
		"$0 o11y tracing settings delete\n\nReset the zone-level Cloudflare Traces settings to their defaults while preserving the sampling rules.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
