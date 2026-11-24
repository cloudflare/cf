/**
 * get command
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Export Zaraz configuration",
	usage:
		"$0 zaraz export get\n\nExports full current published Zaraz configuration for a zone, secret variables included.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
