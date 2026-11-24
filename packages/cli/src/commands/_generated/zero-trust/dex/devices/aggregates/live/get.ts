/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"since-minutes": {
			kind: "parsed",
			brief: "Number of minutes before current time.",
			parse: Number,
		},
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
	command: "get",
	describe: "Get live aggregate device details by dimension",
	usage:
		"$0 zero-trust dex devices aggregates live get\n\nGet details for live (up to 60 minutes) devices using WARP.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
