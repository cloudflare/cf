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
	describe: "Get all behaviors and associated configuration",
	usage:
		"$0 zero-trust risk-scoring behaviours get\n\nRetrieves configured risk score behaviors that define how user actions affect their overall risk score.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
