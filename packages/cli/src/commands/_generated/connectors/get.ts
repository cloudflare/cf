/**
 * get command
 * @generated from apis/overlays/connectors.ts
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
		{ placeholder: "connector-id", brief: "Connector ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <connector-id>",
	describe: "Get Connector",
	usage: "$0 connectors get <connector-id>\n\nGets a Magic WAN Connector.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
