/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		enabled: {
			kind: "enum",
			brief: "Enabled",
			values: ["true", "false"],
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
	describe: "List account interests for PIR Option 2",
	usage:
		"$0 cloudforce-one priority-intelligence interests list\n\nLists structured account interests for Priority Intelligence Option 2. Filter by enabled state and paginate results.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
