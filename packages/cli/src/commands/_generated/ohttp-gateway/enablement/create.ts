/**
 * create command
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Enable OHTTP Gateway",
	usage:
		"$0 ohttp-gateway enablement create\n\nIdempotently enables OHTTP Gateway for the zone. Requires product subscription to call.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
