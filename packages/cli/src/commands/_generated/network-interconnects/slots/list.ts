/**
 * list command
 * @generated from apis/overlays/network-interconnects.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"address-contains": {
			kind: "parsed",
			brief:
				"If specified, only show slots with the given text in their address field",
			optional: true,
			parse: String,
		},
		site: {
			kind: "parsed",
			brief: "If specified, only show slots located at the given site",
			optional: true,
			parse: String,
		},
		speed: {
			kind: "parsed",
			brief: "If specified, only show slots that support the given speed",
			optional: true,
			parse: String,
		},
		occupied: {
			kind: "boolean",
			brief:
				"If specified, only show slots with a specific occupied/unoccupied state",
			optional: true,
		},
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: Number },
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
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
	describe: "Retrieve a list of all slots matching the specified parameters",
	usage:
		"$0 network-interconnects slots list\n\nLists all available infrastructure slots for the account, showing allocation status and capacity.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
