/**
 * list command
 * @generated from apis/overlays/connector-interrupts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"connector-id": { kind: "parsed", brief: "Connector ID", parse: String },
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
	describe: "List Interrupts",
	usage:
		"$0 connector-interrupts list\n\nLists interrupts for a Magic WAN Connector.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
