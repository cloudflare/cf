/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
		{ placeholder: "integration-id", brief: "API UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <integration-id>",
	describe: "Get posture integration",
	usage:
		"$0 zero-trust devices posture integrations get <integration-id>\n\nFetches details for a single device posture integration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
