/**
 * get command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "flag-key",
			brief: "Case-sensitive key identifying the flag within the app.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <flag-key>",
	describe: "Get flag",
	usage:
		"$0 flagship apps flags get <flag-key>\n\nReturns the full flag definition including rules, variations, metadata, and audit fields.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
