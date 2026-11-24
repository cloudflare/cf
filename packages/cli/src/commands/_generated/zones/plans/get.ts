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
		{ placeholder: "plan-identifier", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <plan-identifier>",
	describe: "Available Plan Details",
	usage:
		"$0 zones plans get <plan-identifier>\n\nDetails of the available plan that the zone can subscribe to.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
