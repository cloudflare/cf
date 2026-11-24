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
		{ placeholder: "reference-id", brief: "Reference ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <reference-id>",
	describe: "Get risk score integration by reference id.",
	usage:
		"$0 zero-trust risk-scoring integrations references get <reference-id>\n\nRetrieves a Zero Trust risk score integration using its external reference ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
