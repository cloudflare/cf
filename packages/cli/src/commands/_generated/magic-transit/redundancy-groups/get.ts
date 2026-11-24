/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
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
		{ placeholder: "redundancy-group-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <redundancy-group-id>",
	describe: "Get Redundancy Group Details",
	usage:
		"$0 magic-transit redundancy-groups get <redundancy-group-id>\n\nGets details for a specific redundancy group, including full member tunnel data.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
