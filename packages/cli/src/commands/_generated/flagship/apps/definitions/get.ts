/**
 * get command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"if-none-match": {
			kind: "parsed",
			brief: "Previously returned ETag, or `*`.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "app-id",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <app-id>",
	describe: "Get flag definitions",
	usage:
		"$0 flagship apps definitions get <app-id>\n\nReturns an app's evaluation-only flag definitions for SDKs that evaluate locally. Send the returned `ETag` in `If-None-Match` to avoid downloading unchanged definitions.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
