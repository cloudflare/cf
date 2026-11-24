/**
 * get command
 * @generated from apis/overlays/content-scan.ts
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
	describe: "Get the Content Scanning status for a zone.",
	usage:
		"$0 content-scan get\n\nGet the current Content Scanning status for the zone, together with the date the status was last modified.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
