/**
 * get command
 * @generated from apis/overlays/page-rules.ts
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
		{ placeholder: "pagerule-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pagerule-id>",
	describe: "Get a Page Rule",
	usage:
		"$0 page-rules get <pagerule-id>\n\nFetches the details of a Page Rule.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
