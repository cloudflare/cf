/**
 * list command
 * @generated from apis/overlays/connectors.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"device-type": {
			kind: "enum",
			brief: "Filter connectors by device type.",
			values: ["MANAGED", "LICENSED"],
			optional: true,
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
	command: "list",
	describe: "List Connectors",
	usage: "$0 connectors list\n\nLists Magic WAN Connectors.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
