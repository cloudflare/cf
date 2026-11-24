/**
 * get command
 * @generated from apis/overlays/rum.ts
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
	operands: [{ placeholder: "site-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <site-id>",
	describe: "Get a Web Analytics site",
	usage: "$0 rum site-info get <site-id>\n\nRetrieves a Web Analytics site.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
