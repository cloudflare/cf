/**
 * get command
 * @generated from apis/overlays/realtime.ts
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
			brief: "The app identifier tag.",
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
			placeholder: "preset-id",
			brief: "ID of the preset to fetch",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <preset-id>",
	describe: "Fetch details of a preset",
	usage:
		"$0 realtime kit presets get <preset-id>\n\nFetches details of a preset using the provided preset ID",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
