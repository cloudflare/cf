/**
 * get command
 * @generated from apis/overlays/zones.ts
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
		{ placeholder: "setting-id", brief: "Setting name", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <setting-id>",
	describe: "Get zone setting",
	usage:
		"$0 zones settings get <setting-id>\n\nFetch a single zone setting by name",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
