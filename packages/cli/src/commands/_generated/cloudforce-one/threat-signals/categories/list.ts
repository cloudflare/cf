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
	describe: "List Threat Signals feed categories",
	usage:
		"$0 cloudforce-one threat-signals categories list\n\nLists the predefined categories that can be assigned to feeds.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
