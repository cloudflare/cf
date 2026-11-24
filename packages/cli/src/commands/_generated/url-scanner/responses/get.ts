/**
 * get command
 * @generated from apis/overlays/url-scanner.ts
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
		{ placeholder: "response-id", brief: "Response hash.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <response-id>",
	describe: "Get raw response",
	usage:
		"$0 url-scanner responses get <response-id>\n\nReturns the raw response of the network request. Find the `response_id` in the `data.requests.response.hash`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
