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
		site: {
			kind: "parsed",
			brief: "If specified, only show interconnects located at the given site",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"Type of interconnect to list, such as `direct` or `gcp_partner`. Defaults to `direct`.",
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
	describe: "List existing interconnects",
	usage:
		"$0 network-interconnects interconnects list\n\nLists network interconnects of a single type configured for the account. The `type` query parameter selects the type to list; when omitted, only `direct` interconnects are returned.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
