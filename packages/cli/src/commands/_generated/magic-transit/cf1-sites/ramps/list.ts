/**
 * list command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cf1-site-id": { kind: "parsed", brief: "Identifier", parse: String },
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
	describe: "List CF1 Site Ramps",
	usage:
		"$0 magic-transit cf1-sites ramps list\n\nLists ramps (network connections) associated with a CF1 Site. Ramps represent GRE tunnels, IPsec tunnels, interconnects, or MCONN links.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
