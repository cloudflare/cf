/**
 * list command
 * @generated from apis/overlays/load-balancers.ts
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
	command: "list",
	describe: "List Load Balancer Usage",
	usage:
		"$0 load-balancers account usage list\n\nGet current load balancer resource usage counts for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
