/**
 * delete command
 * @generated from apis/overlays/ohttp-gateway.ts
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
	describe: "Disable OHTTP Gateway",
	usage:
		"$0 ohttp-gateway enablement delete\n\nIdempotently disables Oblivious HTTP Gateway for the zone. Requires product subscription to call.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
