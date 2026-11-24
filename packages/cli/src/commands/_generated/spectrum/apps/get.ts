/**
 * get command
 * @generated from apis/overlays/spectrum.ts
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
	operands: [
		{ placeholder: "app-id", brief: "App identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <app-id>",
	describe: "Get Spectrum application configuration",
	usage:
		"$0 spectrum apps get <app-id>\n\nGets the application configuration of a specific application inside a zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
