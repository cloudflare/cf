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
	describe: "List all event categories",
	usage:
		"$0 cloudforce-one threat-intel events categories catalog list\n\nLists every event category in the catalog, whether or not an event uses it. To list only the categories used in specific datasets, use `threat-intel events categories list`.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
