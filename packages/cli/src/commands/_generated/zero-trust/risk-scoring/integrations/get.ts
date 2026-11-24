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
		{ placeholder: "integration-id", brief: "Integration ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <integration-id>",
	describe: "Get risk score integration by id.",
	usage:
		"$0 zero-trust risk-scoring integrations get <integration-id>\n\nGets a Zero Trust risk score integration by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
