/**
 * get command
 * @generated from apis/overlays/bot-management.ts
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
	command: "get",
	describe: "Get Zone Bot Management Config",
	usage: "$0 bot-management get\n\nRetrieve a zone's Bot Management Config",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
