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
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
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
	describe: "List tag categories",
	usage:
		"$0 cloudforce-one threat-intel tags categories list\n\nLists the account's tag categories. Use `search` to filter them.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
