/**
 * update command
 * @generated from apis/overlays/zaraz.ts
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
		body: {
			kind: "parsed",
			brief: "ID of the Zaraz configuration to restore.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Restore Zaraz historical configuration by ID",
	usage:
		"$0 zaraz history update\n\nRestores a historical published Zaraz configuration by ID for a zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
