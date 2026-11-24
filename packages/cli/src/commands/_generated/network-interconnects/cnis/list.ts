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
		slot: {
			kind: "parsed",
			brief: "If specified, only show CNIs associated with the specified slot",
			optional: true,
			parse: String,
		},
		"tunnel-id": {
			kind: "parsed",
			brief:
				"If specified, only show cnis associated with the specified tunnel id",
			optional: true,
			parse: String,
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
	describe: "List existing CNI objects",
	usage:
		"$0 network-interconnects cnis list\n\nLists all Cloud Network Interconnects (CNIs) configured for the account, showing connection status and parameters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
