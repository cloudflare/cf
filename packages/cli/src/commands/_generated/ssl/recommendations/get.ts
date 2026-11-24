/**
 * get command
 * @generated from apis/overlays/ssl.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "SSL/TLS Recommendation",
	usage:
		"$0 ssl recommendations get\n\nRetrieve the SSL/TLS Recommender's recommendation for a zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
